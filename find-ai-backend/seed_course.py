"""Seed a course into the Find.ai backend via the admin API.

Usage:
    python seed_course.py courses/sample-course.json
"""

import json
import sys

import requests


def main():
    if len(sys.argv) < 2:
        print("Usage: python seed_course.py <path-to-course.json>")
        sys.exit(1)

    path = sys.argv[1]
    with open(path) as f:
        course_data = json.load(f)

    resp = requests.post(
        "http://localhost:8000/api/admin/courses",
        json=course_data,
        headers={"X-Admin-Key": "findai_admin_2024_secret"},
    )

    if resp.status_code == 200:
        print(f"Course created: {resp.json()}")
    else:
        print(f"Error {resp.status_code}: {resp.text}")
        sys.exit(1)


if __name__ == "__main__":
    main()
