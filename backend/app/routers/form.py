from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
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
    SubmissionResponse,
    SubmissionUpdate,
)
from app.services import (
    create_form,
    create_form_field,
    delete_form,
    delete_form_field,
    get_form,
    get_public_form,
    get_submission,
    list_form_fields,
    list_forms,
    list_submissions,
    regenerate_form_link,
    reorder_form_fields,
    require_admin,
    submit_public_form,
    update_form,
    update_form_field,
    update_submission,
)

router = APIRouter(tags=["forms"])


# ── Forms CRUD (admin) ──

@router.post("/forms", response_model=FormResponse, status_code=201)
def api_create_form(
    data: FormCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return create_form(db, data, user)


@router.get("/forms", response_model=list[FormListItem])
def api_list_forms(
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return list_forms(db, user)


@router.get("/forms/{form_id}", response_model=FormResponse)
def api_get_form(
    form_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return get_form(db, form_id, user)


@router.patch("/forms/{form_id}", response_model=FormResponse)
def api_update_form(
    form_id: int,
    data: FormUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return update_form(db, form_id, data, user)


@router.delete("/forms/{form_id}", status_code=204)
def api_delete_form(
    form_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    delete_form(db, form_id, user)


@router.post("/forms/{form_id}/regenerate-link", response_model=FormResponse)
def api_regenerate_link(
    form_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return regenerate_form_link(db, form_id, user)


# ── Fields CRUD (admin, form-scoped) ──

@router.get("/forms/{form_id}/fields", response_model=list[FormFieldResponse])
def api_list_fields(
    form_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return list_form_fields(db, form_id, user)


@router.post("/forms/{form_id}/fields", response_model=FormFieldResponse, status_code=201)
def api_create_field(
    form_id: int,
    data: FormFieldCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return create_form_field(db, form_id, data, user)


@router.patch("/forms/{form_id}/fields/{field_id}", response_model=FormFieldResponse)
def api_update_field(
    form_id: int,
    field_id: int,
    data: FormFieldUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return update_form_field(db, form_id, field_id, data, user)


@router.delete("/forms/{form_id}/fields/{field_id}", status_code=204)
def api_delete_field(
    form_id: int,
    field_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    delete_form_field(db, form_id, field_id, user)


@router.patch("/forms/{form_id}/fields/reorder", response_model=list[FormFieldResponse])
def api_reorder_fields(
    form_id: int,
    data: FieldReorderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return reorder_form_fields(db, form_id, data, user)


# ── Submissions (admin) ──

@router.get("/forms/{form_id}/submissions", response_model=list[SubmissionResponse])
def api_list_submissions(
    form_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return list_submissions(db, form_id, user)


@router.get("/forms/{form_id}/submissions/{submission_id}", response_model=SubmissionResponse)
def api_get_submission(
    form_id: int,
    submission_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return get_submission(db, form_id, submission_id, user)


@router.patch("/forms/{form_id}/submissions/{submission_id}", response_model=SubmissionResponse)
def api_update_submission(
    form_id: int,
    submission_id: int,
    data: SubmissionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    return update_submission(db, form_id, submission_id, data, user)


# ── Public endpoints ──

@router.get("/public/forms/{share_token}", response_model=FormPublicResponse)
def api_public_form(share_token: str, db: Session = Depends(get_db)):
    return get_public_form(db, share_token)


@router.post("/public/forms/{share_token}/submit", response_model=SubmissionResponse, status_code=201)
def api_public_submit(
    share_token: str,
    data: SubmissionCreate,
    db: Session = Depends(get_db),
):
    return submit_public_form(db, share_token, data)
