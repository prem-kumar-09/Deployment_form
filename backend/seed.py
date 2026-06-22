import json

from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models import FormField, FieldType

DEFAULT_FIELDS = [
    {
        "name": "name",
        "label": "Name",
        "field_type": FieldType.text,
        "placeholder": "Enter your name",
        "sort_order": 1,
    },
    {
        "name": "request_date",
        "label": "Request Date",
        "field_type": FieldType.date,
        "placeholder": "M/d/yyyy",
        "sort_order": 2,
    },
    {
        "name": "application_name",
        "label": "Application Name",
        "field_type": FieldType.text,
        "sort_order": 3,
    },
    {
        "name": "git_repository",
        "label": "Git Repository",
        "field_type": FieldType.url,
        "placeholder": "https://github.com/org/repo",
        "sort_order": 4,
    },
    {
        "name": "hosting_url",
        "label": "Hosting URL",
        "field_type": FieldType.url,
        "placeholder": "https://example.com",
        "sort_order": 5,
    },
    {
        "name": "environment",
        "label": "Environment",
        "field_type": FieldType.radio,
        "options": ["test", "Production"],
        "sort_order": 6,
    },
    {
        "name": "deployment_type",
        "label": "Deployment type",
        "field_type": FieldType.radio,
        "options": ["New deployment", "Redeployment"],
        "sort_order": 7,
    },
    {
        "name": "estimated_duration",
        "label": "Estimated Duration",
        "field_type": FieldType.text,
        "placeholder": "e.g. 2 hours",
        "sort_order": 8,
    },
    {
        "name": "deployment_date",
        "label": "Deployment Date",
        "field_type": FieldType.date,
        "placeholder": "M/d/yyyy",
        "sort_order": 9,
    },
    {
        "name": "comments",
        "label": "Comments",
        "field_type": FieldType.textarea,
        "is_required": False,
        "sort_order": 10,
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        if db.query(FormField).count() == 0:
            for item in DEFAULT_FIELDS:
                field_data = dict(item)
                options = field_data.pop("options", None)
                is_required = field_data.pop("is_required", True)
                field = FormField(
                    **field_data,
                    options=json.dumps(options) if options else None,
                    is_required=is_required,
                )
                db.add(field)

        db.commit()
        print("Database seeded successfully.")
        print("Register at http://localhost:3000/register and select User or Admin role.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
