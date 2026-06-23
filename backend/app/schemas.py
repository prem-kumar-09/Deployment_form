import json
from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models import FieldType, SubmissionStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Theme ──

class ThemeConfig(BaseModel):
    bg_color: str = "#ffffff"
    bg_image_url: str | None = None
    font_family: str = "Inter"
    primary_color: str = "#6d28d9"
    text_color: str = "#111827"
    border_radius: int = 8


# ── Forms ──

class FormCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None


class FormUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    theme: ThemeConfig | None = None
    is_active: bool | None = None


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


class FieldReorderItem(BaseModel):
    id: int
    sort_order: int


class FieldReorderRequest(BaseModel):
    fields: list[FieldReorderItem]


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


class FormResponse(BaseModel):
    id: int
    title: str
    description: str | None
    share_token: str
    theme: ThemeConfig | None
    is_active: bool
    fields: list[FormFieldResponse]
    submission_count: int = 0
    created_at: datetime
    updated_at: datetime


class FormListItem(BaseModel):
    id: int
    title: str
    description: str | None
    share_token: str
    is_active: bool
    field_count: int
    submission_count: int
    created_at: datetime
    updated_at: datetime


# ── Public form ──

class FormPublicResponse(BaseModel):
    title: str
    description: str | None
    theme: ThemeConfig | None
    fields: list[FormFieldResponse]


# ── Submissions ──

class SubmissionValueInput(BaseModel):
    field_id: int
    value: str | None = None


class SubmissionCreate(BaseModel):
    values: list[SubmissionValueInput]


class SubmissionFieldValueResponse(BaseModel):
    field_id: int
    field_name: str
    field_label: str
    field_type: FieldType
    value: str | None
    options: list[str] | None = None


class SubmissionResponse(BaseModel):
    id: int
    form_id: int
    submitter_name: str | None
    submitter_email: str | None
    status: SubmissionStatus
    admin_notes: str | None
    values: list[SubmissionFieldValueResponse]
    created_at: datetime
    updated_at: datetime


class SubmissionUpdate(BaseModel):
    status: SubmissionStatus | None = None
    admin_notes: str | None = None
