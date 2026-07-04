"""Admin API routes for course content management."""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator

from db import supabase
from middleware.admin_auth import require_admin_key

router = APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin_key)])


# --- Request / response models ---

class LessonCardIn(BaseModel):
    title: str
    body: str
    visual_hint: Optional[str] = None
    order_index: int


class QuizQuestionIn(BaseModel):
    question: str
    options: list[str]
    correct_index: int
    explanation: str
    order_index: int


class SimChoiceIn(BaseModel):
    text: str
    outcome: str
    feedback: str
    learner_pct: int = 0
    order_index: int

    @field_validator("outcome")
    @classmethod
    def validate_outcome(cls, v: str) -> str:
        if v not in ("risky", "strategic", "balanced"):
            raise ValueError("outcome must be risky, strategic, or balanced")
        return v


class ConceptIn(BaseModel):
    title: str
    slug: str
    description: str
    order_index: int
    lesson_title: str
    lesson_xp: int = 25
    quiz_xp: int = 30
    quiz_pass_threshold: int = 70
    sim_title: str
    sim_scenario: str
    sim_xp: int = 20
    tags: list[str] = []
    cards: list[LessonCardIn] = []
    questions: list[QuizQuestionIn] = []
    choices: list[SimChoiceIn] = []


class ModuleIn(BaseModel):
    title: str
    domain: str
    order_index: int
    concepts: list[ConceptIn] = []

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        if v not in ("markets", "investing", "macro", "corporate_finance"):
            raise ValueError("domain must be markets, investing, macro, or corporate_finance")
        return v


class CourseIn(BaseModel):
    title: str
    description: str
    difficulty: str
    icon_emoji: str
    order_index: int
    modules: list[ModuleIn] = []

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        if v not in ("beginner", "intermediate", "advanced"):
            raise ValueError("difficulty must be beginner, intermediate, or advanced")
        return v


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    icon_emoji: Optional[str] = None
    order_index: Optional[int] = None

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("beginner", "intermediate", "advanced"):
            raise ValueError("difficulty must be beginner, intermediate, or advanced")
        return v


class StatusResponse(BaseModel):
    status: str


class CourseCreatedResponse(BaseModel):
    status: str
    course_id: str


# --- Endpoints ---

@router.post("/courses", response_model=CourseCreatedResponse)
def create_course(payload: CourseIn):
    course_row = supabase.table("courses").insert({
        "title": payload.title,
        "description": payload.description,
        "difficulty": payload.difficulty,
        "icon_emoji": payload.icon_emoji,
        "order_index": payload.order_index,
    }).execute()

    course_id = course_row.data[0]["id"]

    for mod in payload.modules:
        mod_row = supabase.table("modules").insert({
            "course_id": course_id,
            "title": mod.title,
            "domain": mod.domain,
            "order_index": mod.order_index,
        }).execute()

        module_id = mod_row.data[0]["id"]

        for concept in mod.concepts:
            concept_row = supabase.table("concepts").insert({
                "module_id": module_id,
                "title": concept.title,
                "slug": concept.slug,
                "description": concept.description,
                "order_index": concept.order_index,
                "lesson_title": concept.lesson_title,
                "lesson_xp": concept.lesson_xp,
                "quiz_xp": concept.quiz_xp,
                "quiz_pass_threshold": concept.quiz_pass_threshold,
                "sim_title": concept.sim_title,
                "sim_scenario": concept.sim_scenario,
                "sim_xp": concept.sim_xp,
            }).execute()

            concept_id = concept_row.data[0]["id"]

            if concept.cards:
                supabase.table("lesson_cards").insert([
                    {
                        "concept_id": concept_id,
                        "title": c.title,
                        "body": c.body,
                        "visual_hint": c.visual_hint,
                        "order_index": c.order_index,
                    }
                    for c in concept.cards
                ]).execute()

            if concept.questions:
                supabase.table("quiz_questions").insert([
                    {
                        "concept_id": concept_id,
                        "question": q.question,
                        "options": q.options,
                        "correct_index": q.correct_index,
                        "explanation": q.explanation,
                        "order_index": q.order_index,
                    }
                    for q in concept.questions
                ]).execute()

            if concept.choices:
                supabase.table("simulation_choices").insert([
                    {
                        "concept_id": concept_id,
                        "text": ch.text,
                        "outcome": ch.outcome,
                        "feedback": ch.feedback,
                        "learner_pct": ch.learner_pct,
                        "order_index": ch.order_index,
                    }
                    for ch in concept.choices
                ]).execute()

            for tag in concept.tags:
                supabase.table("tags").upsert(
                    {"tag": tag}, on_conflict="tag"
                ).execute()
                supabase.table("concept_tags").insert({
                    "concept_id": concept_id,
                    "tag": tag,
                }).execute()

    return CourseCreatedResponse(status="ok", course_id=course_id)


@router.put("/courses/{course_id}", response_model=StatusResponse)
def update_course(course_id: str, payload: CourseUpdate):
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = supabase.table("courses").update(updates).eq("id", course_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Course not found")

    return StatusResponse(status="ok")


@router.delete("/courses/{course_id}", response_model=StatusResponse)
def delete_course(course_id: str):
    result = supabase.table("courses").delete().eq("id", course_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Course not found")

    return StatusResponse(status="ok")


@router.post("/courses/{course_id}/publish", response_model=StatusResponse)
def publish_course(course_id: str):
    result = supabase.table("courses").update({
        "is_published": True,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", course_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Course not found")

    return StatusResponse(status="ok")


@router.post("/courses/{course_id}/unpublish", response_model=StatusResponse)
def unpublish_course(course_id: str):
    result = supabase.table("courses").update({
        "is_published": False,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", course_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Course not found")

    return StatusResponse(status="ok")
