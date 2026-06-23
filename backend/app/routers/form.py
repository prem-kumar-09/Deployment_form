from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    DeploymentRequestCreate,
    DeploymentRequestResponse,
    DeploymentRequestUpdate,
    FormFieldCreate,
    FormFieldResponse,
    FormFieldUpdate,
    FormSchemaResponse,
)
from app.services import (
    create_form_field,
    create_request,
    delete_form_field,
    get_form_schema,
    get_request,
    list_form_fields,
    list_requests,
    require_admin,
    get_current_user,
    update_form_field,
    update_request,
)
from app.models import User

router = APIRouter(tags=["form"])


@router.get("/form/schema", response_model=FormSchemaResponse)
def form_schema(db: Session = Depends(get_db)):
    return get_form_schema(db)


@router.get("/form/fields", response_model=list[FormFieldResponse])
def form_fields(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return list_form_fields(db, include_inactive=True)


@router.post("/form/fields", response_model=FormFieldResponse, status_code=201)
def create_field(
    data: FormFieldCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return create_form_field(db, data)


@router.patch("/form/fields/{field_id}", response_model=FormFieldResponse)
def patch_field(
    field_id: int,
    data: FormFieldUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return update_form_field(db, field_id, data)


@router.delete("/form/fields/{field_id}", status_code=204)
def remove_field(
    field_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    delete_form_field(db, field_id)


@router.post("/requests", response_model=DeploymentRequestResponse, status_code=201)
def submit_request(
    data: DeploymentRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_request(db, current_user, data)


@router.get("/requests", response_model=list[DeploymentRequestResponse])
def get_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_requests(db, current_user)


@router.get("/requests/{request_id}", response_model=DeploymentRequestResponse)
def get_request_by_id(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_request(db, request_id, current_user)


@router.patch("/requests/{request_id}", response_model=DeploymentRequestResponse)
def patch_request(
    request_id: int,
    data: DeploymentRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_request(db, request_id, data, current_user)
