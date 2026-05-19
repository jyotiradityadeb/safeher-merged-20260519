from pathlib import Path
import argparse

import joblib
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "safety_context_model.joblib"


def predict(place: str, time: str, danger_category: str, specific_danger: str) -> dict:
    model = joblib.load(MODEL_PATH)
    scenario_text = " ".join([place, time, danger_category, specific_danger])
    frame = pd.Series([scenario_text])
    label = model.predict(frame)[0]
    probabilities = model.predict_proba(frame)[0]
    labels = model.named_steps["classifier"].classes_
    confidence = float(probabilities[list(labels).index(label)])
    return {"severity_level": label, "confidence": round(confidence, 4)}


def main() -> None:
    parser = argparse.ArgumentParser(description="Predict safety scenario severity.")
    parser.add_argument("--place", default="Public bus stop")
    parser.add_argument("--time", default="22:30")
    parser.add_argument("--danger-category", default="Stalking")
    parser.add_argument("--specific-danger", default="Followed by stranger while waiting")
    args = parser.parse_args()

    print(
        predict(
            place=args.place,
            time=args.time,
            danger_category=args.danger_category,
            specific_danger=args.specific_danger,
        )
    )


if __name__ == "__main__":
    main()
