import json
from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models import FieldType, RequestStatus, UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=6)
    role: UserRole = UserRole.user


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class UserRoleUpdate(BaseModel):
    role: UserRole


class FormFieldCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100, pattern=r"^[a-z][a-z0-9_]*$")
    label: str = Field(min_length=1, max_length=255)
    field_type: FieldType
    placeholder: str | None = None
    options: list[str] | None = None
    is_required: bool = True
    sort_order: int = 0
    is_active: bool = True

    @field_validator("options")
    @classmethod
    def validate_options(cls, v: list[str] | None, info) -> list[str] | None:
        field_type = info.data.get("field_type")
        if field_type in (FieldType.radio, FieldType.select) and (not v or len(v) < 2):
            raise ValueError("Radio and select fields require at least 2 options")
        return v


class FormFieldUpdate(BaseModel):
    label: str | None = None
    field_type: FieldType | None = None
    placeholder: str | None = None
    options: list[str] | None = None
    is_required: bool | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class FormFieldResponse(BaseModel):
    id: int
    name: str
    label: str
    field_type: FieldType
    placeholder: str | None
    options: list[str] | None
    is_required: bool
    sort_order: int
    is_active: bool

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_field(cls, field) -> "FormFieldResponse":
        options = None
        if field.options:
            options = json.loads(field.options)
        return cls(
            id=field.id,
            name=field.name,
            label=field.label,
            field_type=field.field_type,
            placeholder=field.placeholder,
            options=options,
            is_required=field.is_required,
            sort_order=field.sort_order,
            is_active=field.is_active,
        )


class RequestValueInput(BaseModel):
    field_id: int
    value: str | None = None


class DeploymentRequestCreate(BaseModel):
    values: list[RequestValueInput]


class DeploymentRequestUpdate(BaseModel):
    values: list[RequestValueInput] | None = None
    status: RequestStatus | None = None
    admin_notes: str | None = None


class RequestFieldValueResponse(BaseModel):
    field_id: int
    field_name: str
    field_label: str
    field_type: FieldType
    value: str | None
    options: list[str] | None = None


class DeploymentRequestResponse(BaseModel):
    id: int
    submitter_id: int
    submitter_name: str
    submitter_email: str
    status: RequestStatus
    admin_notes: str | None
    values: list[RequestFieldValueResponse]
    created_at: datetime
    updated_at: datetime


class FormSchemaResponse(BaseModel):
    fields: list[FormFieldResponse]
    title: str = "Deployment Request Sheet"
    description: str = "Submit a deployment request. All required fields must be completed."
