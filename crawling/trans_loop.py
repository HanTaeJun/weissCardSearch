import json
from googletrans import Translator
import time
import asyncio

# 번역기 초기화
translator = Translator()

async def translate_to_korean(text):
    while True:
        try:
            result = translator.translate(text, src="ja", dest="ko")
            return result.text
        except Exception as e:
            print(f"번역 실패, 재시도 중... 에러: {e}")
            time.sleep(2)  # 2초 대기 후 재시도

async def translate_json(input_path, output_path):
    try:
        # JSON 파일 읽기
        with open(input_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        total_cards = len(data)
        print(f"총 {total_cards}개의 카드가 번역 중입니다...")

        # 번역 수행
        for index, card in enumerate(data):
            print(f"{index + 1}/{total_cards} 카드 번역 중... {card['title']}")
            # 실패 시 재시도 로직 포함
            while True:
                try:
                    # card["title"] = await translate_to_korean(card["title"])
                    card["effect"] = await translate_to_korean(card["effect"])
                    break  # 성공 시 루프 탈출
                except Exception as e:
                    print(f"카드 번역 실패, 재시도 중... 에러: {e}")
                    time.sleep(2)  # 2초 대기 후 재시도

        # 번역된 JSON 저장
        with open(output_path, "w", encoding="utf-8") as file:
            json.dump(data, file, ensure_ascii=False, indent=4)

        print(f"번역 완료: {output_path}")

    except Exception as e:
        print(f"에러 발생: {e}")

# 번역 실행
asyncio.run(translate_json("cards_data.json", "translated_data.json"))