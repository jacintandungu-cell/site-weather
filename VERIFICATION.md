# Verification

- Backend CRUD, relationship serialization, JSON errors, PATCH, and CORS were exercised with Flask's test client.
- React production build completed with `CI=true npm run build`.
- Local Pipenv resolves from `backend/Pipfile`.
- Run `pipenv run flask --app app db upgrade` and `pipenv run python seed.py`; SQLite stores data in `siteweather.db`.
- Start services with `pipenv run python app.py` and `npm start` from `frontend`.
- Google Maps remains planned and is intentionally out of scope.