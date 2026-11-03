import argparse
import json
from pathlib import Path

from faster_whisper import WhisperModel


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--model", choices=["tiny", "base", "small"], default="base")
    parser.add_argument("--language", default="auto")
    parser.add_argument("--model-dir", required=True)
    args = parser.parse_args()

    model = WhisperModel(
        args.model,
        device="cpu",
        compute_type="int8",
        download_root=args.model_dir,
        cpu_threads=4,
        num_workers=1,
    )
    segments, info = model.transcribe(
        args.input,
        language=None if args.language == "auto" else args.language,
        beam_size=5,
        vad_filter=True,
        condition_on_previous_text=True,
    )
    result = []
    for segment in segments:
        text = segment.text.strip()
        if not text:
            continue
        item = {"start": round(float(segment.start), 3), "end": round(float(segment.end), 3), "text": text}
        result.append(item)
        print(f"SEGMENT {item['end']}", flush=True)
    payload = {
        "language": info.language,
        "languageProbability": round(float(info.language_probability), 4),
        "duration": round(float(info.duration), 3),
        "segments": result,
    }
    Path(args.output).write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
