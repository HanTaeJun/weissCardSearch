document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            currentPage = 1;
            search();
        }
    });
});

// 한 페이지에 표시될 카드 수
const resultsPerPage = 10;
let currentPage = 1; // 현재 페이지
let searchResults = []; // 검색된 결과

// 줄바꿈을 추가하는 함수
function addLineBreaks(text) {
    return text.replace(/([。])/g, '$1<br/>'); // 일본어일 때 줄바꿈 추가
}

// 검색 함수
function search() {
    const query = document.getElementById('searchInput').value.toLowerCase().split(/\s+/); // 검색어를 공백으로 분리
    const resultsContainer = document.getElementById('results');
    const paginationContainer = document.getElementById('pagination');
    resultsContainer.innerHTML = '';
    paginationContainer.innerHTML = '';

    // 검색어가 비어있는 경우
    if (query.length === 0 || query[0] === '') {
        resultsContainer.innerHTML = '<p>정보를 입력해 주세요.</p>';
        return;
    }

    // 카드 데이터 필터링
    const results = cardData.filter(card => {
        const title = card.title.toLowerCase();
        return query.every(word => title.includes(word)); // 모든 검색어가 제목에 포함되어 있는지 확인
    });

    searchResults = results;

    // 페이지네이션 처리
    const totalPages = Math.ceil(results.length / resultsPerPage);
    displayCards(currentPage);
    createPagination(totalPages);
}

// 검색 결과 카드 표시 함수
function displayCards(page) {
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const pageResults = searchResults.slice(startIndex, endIndex);
    const resultsContainer = document.getElementById('results');

    if (pageResults.length === 0) {
        resultsContainer.innerHTML = '<p>결과를 찾을 수 없습니다.</p>';
        return;
    }

    pageResults.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerHTML = `
            <div class="card-title">${card.title}</div>
            <div>레벨: ${card.level}</div>
            <div>색: ${card.color}</div>
            <div>파워: ${card.power}</div>
            <div>코스트: ${card.cost}</div>
            <div>소울: ${card.soul}</div>
            <div>레어도: ${card.rarity}</div>
            <div>특징: ${card.features}</div>
            <div>플레이버: ${card.flavor}</div>
            <div>효과: ${addLineBreaks(card.effect)}</div>
        `;
        resultsContainer.appendChild(cardDiv);
    });
}

// 페이지 버튼 생성
function createPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    
    // 페이지 버튼이 없으면 생성하지 않음
    if (totalPages <= 1) return;

    // 이전 페이지 버튼
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Prev';
        prevButton.onclick = () => changePage(currentPage - 1);
        paginationContainer.appendChild(prevButton);
    }

    // 페이지 번호 버튼
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => changePage(i);
        if (i === currentPage) {
            pageButton.disabled = true; // 현재 페이지는 클릭할 수 없게 비활성화
        }
        paginationContainer.appendChild(pageButton);
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => changePage(currentPage + 1);
        paginationContainer.appendChild(nextButton);
    }
}

// 페이지 변경 함수
function changePage(page) {
    const totalPages = Math.ceil(searchResults.length / resultsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayCards(currentPage);
}
