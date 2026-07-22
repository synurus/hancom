from transformers import pipeline
from deep_translator import GoogleTranslator

def trans_en_to_ko(sentence):
    """
    주어진 영어 문장을 한국어로 번역하는 함수
    """
    translated_sentence = GoogleTranslator(source='en', target='ko').translate(sentence)
    return translated_sentence

# 1. 요약 파이프라인 생성
summarizer = pipeline(
    "summarization",
    model="t5-small",
)

# 2. 요약할 원문
text = """
Winner of the Pulitzer Prize • New York Times Bestseller • Over Two Million Copies Sold

“One of the most significant projects embarked upon by any intellectual of our generation” (Gregg Easterbrook, New York Times), Guns, Germs, and Steel presents a groundbreaking, unified narrative of human history.

Why did Eurasians conquer, displace, or decimate Native Americans, Australians, and Africans, instead of the reverse? In this “artful, informative, and delightful” (William H. McNeill, New York Review of Books) book, a classic of our time, evolutionary biologist Jared Diamond dismantles racist theories of human history by revealing the environmental factors actually responsible for its broadest patterns.

The story begins 13,000 years ago, when Stone Age hunter-gatherers constituted the entire human population. Around that time, the developmental paths of human societies on different continents began to diverge greatly. Early domestication of wild plants and animals in the Fertile Crescent, China, Mesoamerica, the Andes, and other areas gave peoples of those regions a head start at a new way of life. But the localized origins of farming and herding proved to be only part of the explanation for their differing fates. The unequal rates at which food production spread from those initial centers were influenced by other features of climate and geography, including the disparate sizes, locations, and even shapes of the continents. Only societies that moved away from the hunter-gatherer stage went on to develop writing, technology, government, and organized religions as well as deadly germs and potent weapons of war. It was those societies, adventuring on sea and land, that invaded others, decimating native inhabitants through slaughter and the spread of disease.

A major landmark in our understanding of human societies, Guns, Germs, and Steel chronicles the way in which the modern world, and its inequalities, came to be.
"""

# 3. 요약 실행
summary = summarizer(
    text,
    min_length=20,      # 최소 토큰 수 => 너무 짧은 요약 방지
    max_length=60,      # 최대 토큰 수 => 길이 폭주 방지
    do_sample=False,    # 매 번 동일한 결과
)

# 4. 결과 확인
sum_text = summary[0]['summary_text']

translated_text = trans_en_to_ko(sum_text)

# translated_text = translated_result[0]['translation_text']

print(f"요약 후 번역된 문장: {translated_text}")

# 요약된 영어 문장을 한국어로 번역하여 출력해주세요
# 번역 함수
    # 함수명 : 자유롭게
    # 매개변수 : 자유롭게