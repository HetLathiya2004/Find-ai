"""Public API routes for course content."""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from db import supabase

router = APIRouter(prefix="/api/v1")


# --- Response models ---

class CourseListItem(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    icon_emoji: str
    order_index: int


class CoursesListResponse(BaseModel):
    courses: list[CourseListItem]


class ConceptSummary(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    order_index: int


class ModuleDetail(BaseModel):
    id: str
    title: str
    domain: str
    order_index: int
    concepts: list[ConceptSummary]


class CourseDetail(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    icon_emoji: str
    modules: list[ModuleDetail]


class CourseDetailResponse(BaseModel):
    course: CourseDetail


class LessonCardOut(BaseModel):
    id: str
    title: str
    body: str
    visual_hint: str | None
    order_index: int


class QuizQuestionOut(BaseModel):
    id: str
    question: str
    options: list
    correct_index: int
    explanation: str
    order_index: int


class SimChoiceOut(BaseModel):
    id: str
    text: str
    outcome: str
    feedback: str
    learner_pct: int
    order_index: int


class ConceptDetail(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    lesson_title: str
    lesson_xp: int
    quiz_xp: int
    quiz_pass_threshold: int
    sim_title: str
    sim_scenario: str
    sim_xp: int
    card_count: int
    cards: list[LessonCardOut]
    questions: list[QuizQuestionOut]
    choices: list[SimChoiceOut]
    tags: list[str]


class ConceptDetailResponse(BaseModel):
    concept: ConceptDetail


# --- Endpoints ---

@router.get("/courses", response_model=CoursesListResponse)
def list_courses():
    result = (
        supabase.table("courses")
        .select("id, title, description, difficulty, icon_emoji, order_index")
        .eq("is_published", True)
        .order("order_index")
        .execute()
    )
    return CoursesListResponse(courses=result.data)


@router.get("/courses/{course_id}", response_model=CourseDetailResponse)
def get_course(course_id: str):
    course_result = (
        supabase.table("courses")
        .select("id, title, description, difficulty, icon_emoji")
        .eq("id", course_id)
        .eq("is_published", True)
        .execute()
    )
    if not course_result.data:
        raise HTTPException(status_code=404, detail="Course not found")

    course = course_result.data[0]

    modules_result = (
        supabase.table("modules")
        .select("id, title, domain, order_index")
        .eq("course_id", course_id)
        .order("order_index")
        .execute()
    )

    modules = []
    for mod in modules_result.data:
        concepts_result = (
            supabase.table("concepts")
            .select("id, title, slug, description, order_index")
            .eq("module_id", mod["id"])
            .order("order_index")
            .execute()
        )
        modules.append(ModuleDetail(
            id=mod["id"],
            title=mod["title"],
            domain=mod["domain"],
            order_index=mod["order_index"],
            concepts=concepts_result.data,
        ))

    return CourseDetailResponse(course=CourseDetail(
        id=course["id"],
        title=course["title"],
        description=course["description"],
        difficulty=course["difficulty"],
        icon_emoji=course["icon_emoji"],
        modules=modules,
    ))


@router.get("/concepts/{slug}", response_model=ConceptDetailResponse)
def get_concept(slug: str, include: str = Query("")):
    concept_result = (
        supabase.table("concepts")
        .select("id, title, slug, description, lesson_title, lesson_xp, quiz_xp, quiz_pass_threshold, sim_title, sim_scenario, sim_xp")
        .eq("slug", slug)
        .execute()
    )
    if not concept_result.data:
        raise HTTPException(status_code=404, detail="Concept not found")

    concept = concept_result.data[0]
    concept_id = concept["id"]

    includes = set(include.split(",")) if include else set()

    # Always fetch card_count (lightweight count query)
    card_count_result = (
        supabase.table("lesson_cards")
        .select("id", count="exact")
        .eq("concept_id", concept_id)
        .execute()
    )
    card_count = card_count_result.count or 0

    # Conditionally fetch lesson cards
    cards = []
    if "cards" in includes:
        cards_result = (
            supabase.table("lesson_cards")
            .select("id, title, body, visual_hint, order_index")
            .eq("concept_id", concept_id)
            .order("order_index")
            .execute()
        )
        cards = cards_result.data

    # Conditionally fetch quiz questions
    questions = []
    if "questions" in includes:
        questions_result = (
            supabase.table("quiz_questions")
            .select("id, question, options, correct_index, explanation, order_index")
            .eq("concept_id", concept_id)
            .order("order_index")
            .execute()
        )
        questions = questions_result.data

    # Conditionally fetch simulation choices
    choices = []
    if "choices" in includes:
        choices_result = (
            supabase.table("simulation_choices")
            .select("id, text, outcome, feedback, learner_pct, order_index")
            .eq("concept_id", concept_id)
            .order("order_index")
            .execute()
        )
        choices = choices_result.data

    # Tags always fetched (lightweight, always needed)
    tags_result = (
        supabase.table("concept_tags")
        .select("tag")
        .eq("concept_id", concept_id)
        .execute()
    )
    tags = [row["tag"] for row in tags_result.data]

    return ConceptDetailResponse(concept=ConceptDetail(
        **concept,
        card_count=card_count,
        cards=cards,
        questions=questions,
        choices=choices,
        tags=tags,
    ))
