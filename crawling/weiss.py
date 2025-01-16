from bs4 import BeautifulSoup
import requests
import json
from googletrans import Translator # 구글 번역 라이브러리 사용
import asyncio

# 구글 번역기 객체 초기화
translator = Translator()

# URL
BASE_URL = "https://ws-tcg.com/cardlist/search?page={}" # 페이지 번호를 동적으로 삽입
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}

# html 정보 추출 함수
def extract_card_info(card_row):
    try:
        title_tag = card_row.find("h4").find("a")
        title = title_tag.text.strip()

        spans = card_row.find_all("span")
        level, power, soul, cost, rarity, soultrigger, trigger, features, flavor, effect = "", "", "", "", "", "", "", "", "", ""

        for span in spans:
            text = span.get_text()
            if "レベル：" in text: # 레벨
                level = text.replace("レベル：", "").strip()
            elif "パワー：" in text: # 파워
                power = text.replace("パワー：", "").strip()
            elif "色：" in text:  # 색
                colorLength = len(span.find_all("img"))
                if (colorLength == 0) : color = text.replace("色：", "").strip()
                else: color = span.find("img")['src'].split('/')[-1].split('.')[0]
            elif "ソウル：" in text: # 소울 (img 태그의 갯수만큼)
                soul = len(span.find_all("img"))
            elif "コスト：" in text: # 코스트
                cost = text.replace("コスト：", "").strip()
            elif "レアリティ：" in text: # 레어리티 (클막구분에 유효, 다만 페러럴카드 추가되면 모르겠음)
                rarity = text.replace("レアリティ：", "").strip()
            elif "トリガー：" in text: # 트리거=도라 (img 태그의 갯수만큼) 클라이막스 예외처리필요...
                triggerLength = len(span.find_all("img"))
                if(rarity=="CR"): checkTrigger = span.find_all("img")[-1]['src'].split('/')[-1].split('.')[0]
                else: soultrigger = triggerLength
                if(checkTrigger!="soul" and triggerLength==2): soultrigger = 1; trigger=checkTrigger
                else: soultrigger=checkTrigger
            elif "特徴：" in text: # 특징
                features = text.replace("特徴：", "").strip()
            elif "フレーバー：" in text: # 플레이버 (카드에 적힌 대사같은거)
                flavor = text.replace("フレーバー：", "").strip()
        
        # 카드 효과는 span에없고 마지막 span class가 highlight_target인게 효과길래 이렇게 처리
        effect_tag = card_row.find_all("span", class_="highlight_target")[-1]
        if effect_tag:
            effect = effect_tag.get_text(separator=" ").strip() # 효과

        return {
            "title": title,
            "level": level,
            "power": power,
            "soul": soul,
            "cost": cost,
            "rarity": rarity,
            "soultrigger": soultrigger,
            "trigger": trigger,
            "features": features,
            "flavor": flavor,
            "color": color,
            "effect": effect
        }
    except AttributeError:
        return None

# 크롤링 함수
def crawl_cards(page_start, page_end, keyword):
    all_cards = []

    for page in range(page_start, page_end + 1): # page_start에서 page_end까지 크롤링
        print(f"페이지 {page} 크롤링 중...")
        response = requests.post(BASE_URL.format(page), headers=HEADERS, data={"keyword": keyword, "parallel": 1}) # 패러렐카드 제외 키워드
        
        if response.status_code != 200:
            print(f"페이지 {page}를 가져오지 못했습니다. 상태 코드: {response.status_code}")
            continue
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        card_rows = soup.find_all("tr")
        
        for row in card_rows:
            card_info = extract_card_info(row)
            if card_info:
                all_cards.append(card_info)

    return all_cards

# 구글 번역 함수
async def translate_to_korean(text):
    translator = Translator()
    result = await translator.translate(text, src="ja", dest="ko")
    return result.text

    
# 번역된 카드 정보 생성 함수
async def process_translation(cards):
    total = len(cards)  # 총 작업 수
    translated_cards = []
    for index, card in enumerate(cards, start=1):
        translated_card = card.copy()  # 원본 카드 데이터 복사
        try:
            print(f"[{index}/{total}] 번역 중: {card['title']}")
            # translated_card["title"] = await translate_to_korean(card["title"])
            # translated_card["flavor"] = await translate_to_korean(card["flavor"])
            translated_card["effect"] = await translate_to_korean(card["effect"])
            # translated_card["features"] = await translate_to_korean(card["features"])
        except Exception as e:
            print(f"번역 실패: {e}")
        translated_cards.append(translated_card)
        print(f"[{index}/{total}] 번역 완료: {translated_card['title']}")
    return translated_cards

# JSON 파일로 저장 함수
def save_to_json(data, filename="cards_data.json"):
    with open(filename, "w", encoding="utf-8") as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4) # JSON 파일로 저장

# 실행
if __name__ == "__main__":
    page_start = 1 # 시작 페이지
    page_end = 1 # 끝 페이지 250116기준 1379페이지가 끝 (전체).
    keyword = "BAV/W112-141" # 검색할 검색어
    cards_data = crawl_cards(page_start, page_end, keyword)
    
    if cards_data:
        save_to_json(cards_data) # 크롤링된 카드 데이터를 JSON 파일로 저장

        # 번역된 한글 카드 데이터 저장
        # translated_data = asyncio.run(process_translation(cards_data))
        # save_to_json(translated_data, "cards_data_kr.json")

        print(f"{page_end - page_start + 1} 페이지의 카드 정보가 JSON 파일로 저장되었습니다.")
    else:
        print("카드 데이터를 크롤링하지 못했습니다.")
