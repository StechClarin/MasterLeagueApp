# -*- coding: utf-8 -*-
"""Tests GraphQL : lecture, pagination, sécurité, contexte établissement."""
from .base import HubTestCase


class GraphQLTests(HubTestCase):
    def test_schema_introspection(self):
        resp = self.graphql(
            "{ __schema { queryType { fields { name } } } }", token=self.token
        )
        self.assertEqual(resp.status_code, 200)
        fields = resp.json()["data"]["__schema"]["queryType"]["fields"]
        names = {f["name"] for f in fields}
        # Champs essentiels attendus
        for expected in ("me", "users", "establishments", "students", "modules", "classrooms"):
            self.assertIn(expected, names)

    def test_me_authenticated(self):
        resp = self.graphql("{ me { id username email } }", token=self.token)
        body = resp.json()
        self.assertIsNone(body.get("errors"))
        self.assertEqual(body["data"]["me"]["username"], self.superuser.username)

    def test_me_unauthenticated_returns_null(self):
        resp = self.graphql("{ me { id username email } }", token=None)
        body = resp.json()
        self.assertIsNone(body["data"]["me"])

    def test_establishments_paginated(self):
        resp = self.graphql(
            "{ establishments { totalCount items { id name } } }", token=self.token
        )
        body = resp.json()
        self.assertIsNone(body.get("errors"))
        self.assertGreaterEqual(body["data"]["establishments"]["totalCount"], 1)

    def test_establishments_search(self):
        resp = self.graphql(
            '{ establishments(search: "Test") { totalCount items { id name } } }',
            token=self.token,
        )
        body = resp.json()
        self.assertIsNone(body.get("errors"))
        self.assertGreaterEqual(body["data"]["establishments"]["totalCount"], 1)

    def test_establishment_by_id(self):
        resp = self.graphql(
            f'{{ establishment(id: "{self.establishment.id}") {{ id name code }} }}',
            token=self.token,
        )
        body = resp.json()
        self.assertIsNone(body.get("errors"))
        self.assertEqual(body["data"]["establishment"]["code"], self.establishment.code)

    def test_establishment_not_found_returns_null(self):
        resp = self.graphql(
            '{ establishment(id: "00000000-0000-0000-0000-000000000000") { id name } }',
            token=self.token,
        )
        self.assertIsNone(resp.json()["data"]["establishment"])

    def test_users_query_hides_ethernanos(self):
        resp = self.graphql(
            "{ users { totalCount items { username } } }", token=self.token
        )
        body = resp.json()
        self.assertIsNone(body.get("errors"))
        usernames = [u["username"] for u in body["data"]["users"]["items"]]
        self.assertNotIn("ethernanos", usernames)

    def test_students_paginated(self):
        resp = self.graphql(
            "{ students(page: 1, pageSize: 5) { totalCount items { id firstName lastName } } }",
            token=self.token,
            est_id=self.establishment.id,
        )
        body = resp.json()
        self.assertIsNone(body.get("errors"))

    def test_invalid_query_returns_errors(self):
        resp = self.graphql("{ this_field_does_not_exist { x } }", token=self.token)
        body = resp.json()
        self.assertIn(resp.status_code, (200, 400))
        self.assertTrue(body.get("errors"))

    def test_dashboard_data(self):
        resp = self.graphql(
            "{ dashboardData { totalStudents totalTeachers } }", token=self.token
        )
        self.assertIsNone(resp.json().get("errors"))
