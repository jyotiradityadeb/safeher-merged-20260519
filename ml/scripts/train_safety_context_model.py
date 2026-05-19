from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline


ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "data" / "women_safety_dataset_v2.csv"
MODEL_DIR = ROOT / "models"
MODEL_PATH = MODEL_DIR / "safety_context_model.joblib"
METRICS_PATH = MODEL_DIR / "safety_context_metrics.json"

TEXT_COLUMNS = ["Place", "time", "danger_category", "specific_danger"]
TARGET_COLUMN = "severity_level"
MODEL_INPUT_COLUMN = "scenario_text"


def combine_text_columns(frame: pd.DataFrame) -> pd.Series:
    return frame[TEXT_COLUMNS].fillna("").astype(str).agg(" ".join, axis=1)


def build_pipeline() -> Pipeline:
    return Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
            ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ]
    )


def main() -> None:
    frame = pd.read_csv(DATASET_PATH)
    missing_columns = [column for column in [*TEXT_COLUMNS, TARGET_COLUMN] if column not in frame.columns]
    if missing_columns:
        raise ValueError(f"Dataset is missing required columns: {missing_columns}")

    frame[MODEL_INPUT_COLUMN] = combine_text_columns(frame)
    X = frame[MODEL_INPUT_COLUMN]
    y = frame[TARGET_COLUMN]
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.3,
        random_state=42,
        stratify=y,
    )

    evaluation_model = build_pipeline()
    evaluation_model.fit(X_train, y_train)
    predictions = evaluation_model.predict(X_test)

    report = classification_report(y_test, predictions, output_dict=True, zero_division=0)
    metrics = {
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "sample_count": int(len(frame)),
        "train_count": int(len(X_train)),
        "test_count": int(len(X_test)),
        "labels": sorted(y.unique().tolist()),
        "features": TEXT_COLUMNS,
        "classification_report": report,
    }

    model = build_pipeline()
    model.fit(X, y)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print(classification_report(y_test, predictions, zero_division=0))
    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved metrics to {METRICS_PATH}")


if __name__ == "__main__":
    main()
