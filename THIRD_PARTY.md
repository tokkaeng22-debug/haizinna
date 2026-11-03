# 사용한 무료 오픈소스

| 구성 요소 | 용도 | 라이선스 / 출처 |
|---|---|---|
| FFmpeg | 프록시·파형·최종 렌더링 | LGPL/GPL, 빌드 옵션에 따라 다름. [공식 안내](https://ffmpeg.org/legal.html) |
| ffmpeg-static | FFmpeg 실행 파일 설치 | GPL-3.0-or-later, [프로젝트](https://github.com/eugeneware/ffmpeg-static) |
| @ffprobe-installer/ffprobe | 미디어 정보 확인 | LGPL-2.1, [프로젝트](https://github.com/SavageCore/node-ffprobe-installer) |
| Express | 로컬 HTTP 서버 | MIT, [프로젝트](https://github.com/expressjs/express) |
| Demucs 4.0.1 | CPU 목소리·배경음악 분리 | MIT, [공식 프로젝트](https://github.com/facebookresearch/demucs) |
| faster-whisper 1.2.1 | 로컬 CPU 음성 인식·자막 생성 | MIT, [공식 프로젝트](https://github.com/SYSTRAN/faster-whisper) |
| CTranslate2 | Whisper 모델의 CPU 추론 | MIT, [공식 프로젝트](https://github.com/OpenNMT/CTranslate2) |
| PyTorch / torchaudio | 로컬 AI 실행 | BSD 계열, [PyTorch](https://github.com/pytorch/pytorch) / [Audio](https://github.com/pytorch/audio) |
| uv | 격리 Python 설치 | MIT / Apache-2.0, [프로젝트](https://github.com/astral-sh/uv) |
| Playwright / agent-browser | 개발용 브라우저 검증 | Apache-2.0, [Playwright](https://github.com/microsoft/playwright) / [agent-browser](https://github.com/vercel-labs/agent-browser) |

실행용 패키지는 npm 잠금 파일에 기록됩니다. 각 라이선스 원문은 설치된 패키지와 공식 저장소에서 확인할 수 있습니다. FFmpeg의 libx264 포함 빌드는 GPL 적용 대상입니다. 바이너리를 재배포할 경우 해당 빌드의 소스 제공 등 라이선스 조건을 따라야 합니다. 이 앱은 원격 유료 API나 CapCut 에셋을 사용하지 않습니다.
