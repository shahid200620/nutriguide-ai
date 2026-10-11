def test_empty_state_uses_weight_based_target(client, onboarded):
    d = client.get("/api/hydration/today", headers=onboarded).json()
    assert d["target_ml"] == 2450 and d["consumed_ml"] == 0 and d["entries"] == [] and d["percent"] == 0


def test_add_and_delete(client, onboarded):
    a = client.post("/api/hydration", json={"amount_ml": 500}, headers=onboarded)
    assert a.status_code == 201 and a.json()["logged_at"].endswith("Z")
    client.post("/api/hydration", json={"amount_ml": 250}, headers=onboarded)
    d = client.get("/api/hydration/today", headers=onboarded).json()
    assert d["consumed_ml"] == 750 and d["remaining_ml"] == 1700 and d["percent"] == 31 and len(d["entries"]) == 2
    assert client.delete(f"/api/hydration/{a.json()['id']}", headers=onboarded).status_code == 204
    assert client.get("/api/hydration/today", headers=onboarded).json()["consumed_ml"] == 250


def test_invalid_amounts(client, onboarded):
    for amt in (0, -100, 99999):
        assert client.post("/api/hydration", json={"amount_ml": amt}, headers=onboarded).status_code == 422


def test_percent_caps_at_100(client, onboarded):
    for _ in range(3):
        client.post("/api/hydration", json={"amount_ml": 1000}, headers=onboarded)
    d = client.get("/api/hydration/today", headers=onboarded).json()
    assert d["percent"] == 100 and d["remaining_ml"] == 0
