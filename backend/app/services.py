import json

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth import decode_access_token
from app.database import get_db
from app.models import DeploymentRequest, FormField, RequestFieldValue, User, UserRole
from app.schemas import (
    DeploymentRequestCreate,
    DeploymentRequestResponse,
    DeploymentRequestUpdate,
    FormFieldCreate,
    FormFieldResponse,
    FormFieldUpdate,
    FormSchemaResponse,
    RequestFieldValueResponse,
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


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


def _serialize_field(field: FormField) -> FormFieldResponse:
    return FormFieldResponse.from_orm_field(field)


def _build_request_response(request: DeploymentRequest) -> DeploymentRequestResponse:
    values = []
    for rv in request.values:
        field = rv.field
        options = json.loads(field.options) if field.options else None
        values.append(
            RequestFieldValueResponse(
                field_id=field.id,
                field_name=field.name,
                field_label=field.label,
                field_type=field.field_type,
                value=rv.value,
                options=options,
            )
        )
    field_order = {rv.field.id: rv.field.sort_order for rv in request.values}
    values.sort(key=lambda v: field_order.get(v.field_id, 0))

    return DeploymentRequestResponse(
        id=request.id,
        submitter_id=request.submitter_id,
        submitter_name=request.submitter.name,
        submitter_email=request.submitter.email,
        status=request.status,
        admin_notes=request.admin_notes,
        values=values,
        created_at=request.created_at,
        updated_at=request.updated_at,
    )


def validate_submission_values(db: Session, values: list, is_update: bool = False) -> dict[int, str | None]:
    active_fields = (
        db.query(FormField)
        .filter(FormField.is_active.is_(True))
        .order_by(FormField.sort_order)
        .all()
    )
    field_map = {f.id: f for f in active_fields}
    submitted = {v.field_id: v.value for v in values}

    if not is_update:
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

    return validated


def get_form_schema(db: Session) -> FormSchemaResponse:
    fields = (
        db.query(FormField)
        .filter(FormField.is_active.is_(True))
        .order_by(FormField.sort_order)
        .all()
    )
    return FormSchemaResponse(fields=[_serialize_field(f) for f in fields])


def create_request(db: Session, user: User, data: DeploymentRequestCreate) -> DeploymentRequestResponse:
    validated = validate_submission_values(db, data.values)
    request = DeploymentRequest(submitter_id=user.id)
    db.add(request)
    db.flush()

    for field_id, value in validated.items():
        db.add(RequestFieldValue(request_id=request.id, field_id=field_id, value=value))

    db.commit()
    db.refresh(request)
    request = (
        db.query(DeploymentRequest)
        .filter(DeploymentRequest.id == request.id)
        .first()
    )
    return _build_request_response(request)


def list_requests(db: Session, user: User) -> list[DeploymentRequestResponse]:
    query = db.query(DeploymentRequest)
    if user.role != UserRole.admin:
        query = query.filter(DeploymentRequest.submitter_id == user.id)

    requests = query.order_by(DeploymentRequest.created_at.desc()).all()
    return [_build_request_response(r) for r in requests]


def get_request(db: Session, request_id: int, user: User) -> DeploymentRequestResponse:
    request = db.query(DeploymentRequest).filter(DeploymentRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if user.role != UserRole.admin and request.submitter_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return _build_request_response(request)


def update_request(
    db: Session, request_id: int, data: DeploymentRequestUpdate, user: User
) -> DeploymentRequestResponse:
    request = db.query(DeploymentRequest).filter(DeploymentRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    is_admin = user.role == UserRole.admin
    is_owner = request.submitter_id == user.id

    if not is_admin and not is_owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if data.status is not None or data.admin_notes is not None:
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can update status and notes",
            )
        if data.status is not None:
            request.status = data.status
        if data.admin_notes is not None:
            request.admin_notes = data.admin_notes

    if data.values is not None:
        validated = validate_submission_values(db, data.values, is_update=True)
        existing = {rv.field_id: rv for rv in request.values}
        for field_id, value in validated.items():
            if field_id in existing:
                existing[field_id].value = value
            else:
                db.add(RequestFieldValue(request_id=request.id, field_id=field_id, value=value))

    db.commit()
    db.refresh(request)
    return _build_request_response(request)


def list_form_fields(db: Session, include_inactive: bool = False) -> list[FormFieldResponse]:
    query = db.query(FormField).order_by(FormField.sort_order)
    if not include_inactive:
        query = query.filter(FormField.is_active.is_(True))
    return [_serialize_field(f) for f in query.all()]


def create_form_field(db: Session, data: FormFieldCreate) -> FormFieldResponse:
    existing = db.query(FormField).filter(FormField.name == data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Field name already exists")

    field = FormField(
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


def update_form_field(db: Session, field_id: int, data: FormFieldUpdate) -> FormFieldResponse:
    field = db.query(FormField).filter(FormField.id == field_id).first()
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
