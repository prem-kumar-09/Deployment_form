import json

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth import decode_access_token
from app.database import get_db
from app.models import (
    Form,
    FormField,
    FormSubmission,
    SubmissionFieldValue,
    User,
    UserRole,
    generate_share_token,
)
from app.schemas import (
    FieldReorderRequest,
    FormCreate,
    FormFieldCreate,
    FormFieldResponse,
    FormFieldUpdate,
    FormListItem,
    FormPublicResponse,
    FormResponse,
    FormUpdate,
    SubmissionCreate,
    SubmissionFieldValueResponse,
    SubmissionResponse,
    SubmissionUpdate,
    ThemeConfig,
    UserResponse,
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Auth helpers ──

def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == int(user_id), User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


# ── Serialisation helpers ──

def _serialize_field(field: FormField) -> FormFieldResponse:
    return FormFieldResponse.from_orm_field(field)


def _parse_theme(theme_json: str | None) -> ThemeConfig | None:
    if not theme_json:
        return None
    try:
        return ThemeConfig(**json.loads(theme_json))
    except Exception:
        return None


def _build_submission_response(sub: FormSubmission) -> SubmissionResponse:
    values = []
    for sv in sub.values:
        field = sv.field
        options = json.loads(field.options) if field.options else None
        values.append(
            SubmissionFieldValueResponse(
                field_id=field.id,
                field_name=field.name,
                field_label=field.label,
                field_type=field.field_type,
                value=sv.value,
                options=options,
            )
        )
    field_order = {sv.field.id: sv.field.sort_order for sv in sub.values}
    values.sort(key=lambda v: field_order.get(v.field_id, 0))

    return SubmissionResponse(
        id=sub.id,
        form_id=sub.form_id,
        submitter_name=sub.submitter_name,
        submitter_email=sub.submitter_email,
        status=sub.status,
        admin_notes=sub.admin_notes,
        values=values,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
    )


# ── Forms CRUD ──

def create_form(db: Session, data: FormCreate, user: User) -> FormResponse:
    form = Form(
        title=data.title,
        description=data.description,
        created_by=user.id,
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return _build_form_response(form)


def list_forms(db: Session, user: User) -> list[FormListItem]:
    forms = (
        db.query(Form)
        .filter(Form.created_by == user.id)
        .order_by(Form.created_at.desc())
        .all()
    )
    result = []
    for f in forms:
        result.append(
            FormListItem(
                id=f.id,
                title=f.title,
                description=f.description,
                share_token=f.share_token,
                is_active=f.is_active,
                field_count=len(f.fields),
                submission_count=len(f.submissions),
                created_at=f.created_at,
                updated_at=f.updated_at or f.created_at,
            )
        )
    return result


def get_form(db: Session, form_id: int, user: User) -> FormResponse:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return _build_form_response(form)


def update_form(db: Session, form_id: int, data: FormUpdate, user: User) -> FormResponse:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    update_data = data.model_dump(exclude_unset=True)
    if "theme" in update_data and update_data["theme"] is not None:
        update_data["theme"] = json.dumps(update_data["theme"])
    elif "theme" in update_data and update_data["theme"] is None:
        update_data["theme"] = None

    for key, value in update_data.items():
        setattr(form, key, value)

    db.commit()
    db.refresh(form)
    return _build_form_response(form)


def delete_form(db: Session, form_id: int, user: User) -> None:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    db.delete(form)
    db.commit()


def regenerate_form_link(db: Session, form_id: int, user: User) -> FormResponse:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    form.share_token = generate_share_token()
    db.commit()
    db.refresh(form)
    return _build_form_response(form)


def _build_form_response(form: Form) -> FormResponse:
    return FormResponse(
        id=form.id,
        title=form.title,
        description=form.description,
        share_token=form.share_token,
        theme=_parse_theme(form.theme),
        is_active=form.is_active,
        fields=[_serialize_field(f) for f in form.fields],
        submission_count=len(form.submissions),
        created_at=form.created_at,
        updated_at=form.updated_at or form.created_at,
    )


# ── Fields CRUD (form-scoped) ──

def list_form_fields(db: Session, form_id: int, user: User) -> list[FormFieldResponse]:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return [_serialize_field(f) for f in form.fields]


def create_form_field(db: Session, form_id: int, data: FormFieldCreate, user: User) -> FormFieldResponse:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    existing = (
        db.query(FormField)
        .filter(FormField.form_id == form_id, FormField.name == data.name)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Field name already exists in this form")

    field = FormField(
        form_id=form_id,
        name=data.name,
        label=data.label,
        field_type=data.field_type,
        placeholder=data.placeholder,
        options=json.dumps(data.options) if data.options else None,
        is_required=data.is_required,
        sort_order=data.sort_order,
        is_active=data.is_active,
    )
    db.add(field)
    db.commit()
    db.refresh(field)
    return _serialize_field(field)


def update_form_field(
    db: Session, form_id: int, field_id: int, data: FormFieldUpdate, user: User
) -> FormFieldResponse:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    field = db.query(FormField).filter(FormField.id == field_id, FormField.form_id == form_id).first()
    if not field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field not found")

    update_data = data.model_dump(exclude_unset=True)
    if "options" in update_data:
        update_data["options"] = json.dumps(update_data["options"]) if update_data["options"] else None

    for key, value in update_data.items():
        setattr(field, key, value)

    db.commit()
    db.refresh(field)
    return _serialize_field(field)


def delete_form_field(db: Session, form_id: int, field_id: int, user: User) -> None:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    field = db.query(FormField).filter(FormField.id == field_id, FormField.form_id == form_id).first()
    if not field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field not found")

    has_values = db.query(SubmissionFieldValue).filter(SubmissionFieldValue.field_id == field_id).first()
    if has_values:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete field that has submitted values. Deactivate it instead.",
        )

    db.delete(field)
    db.commit()


def reorder_form_fields(
    db: Session, form_id: int, data: FieldReorderRequest, user: User
) -> list[FormFieldResponse]:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    field_map = {f.id: f for f in form.fields}
    for item in data.fields:
        field = field_map.get(item.id)
        if field:
            field.sort_order = item.sort_order

    db.commit()
    db.refresh(form)
    return [_serialize_field(f) for f in form.fields]


# ── Public form access ──

def get_public_form(db: Session, share_token: str) -> FormPublicResponse:
    form = db.query(Form).filter(Form.share_token == share_token, Form.is_active.is_(True)).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found or inactive")

    active_fields = [f for f in form.fields if f.is_active]
    return FormPublicResponse(
        title=form.title,
        description=form.description,
        theme=_parse_theme(form.theme),
        fields=[_serialize_field(f) for f in active_fields],
    )


def submit_public_form(db: Session, share_token: str, data: SubmissionCreate) -> SubmissionResponse:
    form = db.query(Form).filter(Form.share_token == share_token, Form.is_active.is_(True)).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found or inactive")

    active_fields = [f for f in form.fields if f.is_active]
    field_map = {f.id: f for f in active_fields}
    submitted = {v.field_id: v.value for v in data.values}

    for field in active_fields:
        if field.is_required and not submitted.get(field.id, "").strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Field '{field.label}' is required",
            )

    validated: dict[int, str | None] = {}
    for field_id, value in submitted.items():
        field = field_map.get(field_id)
        if not field:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unknown or inactive field id: {field_id}",
            )
        if field.is_required and not (value or "").strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Field '{field.label}' is required",
            )
        if value and field.options:
            options = json.loads(field.options)
            if value not in options:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid option for '{field.label}'",
                )
        validated[field_id] = value.strip() if value else None

    submitter_name = None
    submitter_email = None
    for fid, val in validated.items():
        f = field_map.get(fid)
        if f and f.field_type.value == "email" and val:
            submitter_email = val
        if f and f.name == "name" and val:
            submitter_name = val

    submission = FormSubmission(
        form_id=form.id,
        submitter_name=submitter_name,
        submitter_email=submitter_email,
    )
    db.add(submission)
    db.flush()

    for field_id, value in validated.items():
        db.add(SubmissionFieldValue(submission_id=submission.id, field_id=field_id, value=value))

    db.commit()
    db.refresh(submission)
    return _build_submission_response(submission)


# ── Submissions (admin) ──

def list_submissions(db: Session, form_id: int, user: User) -> list[SubmissionResponse]:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    subs = (
        db.query(FormSubmission)
        .filter(FormSubmission.form_id == form_id)
        .order_by(FormSubmission.created_at.desc())
        .all()
    )
    return [_build_submission_response(s) for s in subs]


def get_submission(db: Session, form_id: int, submission_id: int, user: User) -> SubmissionResponse:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    sub = (
        db.query(FormSubmission)
        .filter(FormSubmission.id == submission_id, FormSubmission.form_id == form_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    return _build_submission_response(sub)


def update_submission(
    db: Session, form_id: int, submission_id: int, data: SubmissionUpdate, user: User
) -> SubmissionResponse:
    form = db.query(Form).filter(Form.id == form_id, Form.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    sub = (
        db.query(FormSubmission)
        .filter(FormSubmission.id == submission_id, FormSubmission.form_id == form_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    if data.status is not None:
        sub.status = data.status
    if data.admin_notes is not None:
        sub.admin_notes = data.admin_notes

    db.commit()
    db.refresh(sub)
    return _build_submission_response(sub)
