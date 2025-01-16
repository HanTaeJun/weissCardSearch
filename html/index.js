document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            search(true);
        }
    });
    document.getElementById('scrollTopButton').onclick = function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
});

const resultsPerPage = 10; // 한 페이지에 표시될 카드 수
let currentPage = 1; // 현재 페이지
let searchResults = []; // 검색된 결과

// 스크롤 위치에 따라 "맨 위로" 버튼의 보이기/숨기기
window.onscroll = function() {
    const scrollTopButton = document.getElementById('scrollTopButton');
    
    // 현재 스크롤 위치가 100px 이상일 때 "맨 위로" 버튼을 보이도록 설정
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollTopButton.style.display = "block";
    } else {
        scrollTopButton.style.display = "none";
    }
};

// 필터링
function addLineBreaks(text) {
    // '、'와 '。'을 기준으로 줄바꿈을 삽입
    // return text.replace(/([、。])/g, '$1<br/>'); // 일본어일때
    return text.replace(/([.])/g, '$1<br/>');
}

// 검색 함수
function search(started) {
    if (started) {
        currentPage = 1;
    }
    const query = document.getElementById('searchInput').value.toLowerCase().split(/\s+/); // 검색어를 공백으로 분리
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    // 검색어가 비어있는 경우
    if (query.length === 0 || query[0] === '') {
        resultsContainer.innerHTML = '<p>정보를 입력해주세용용</p>';
        return;
    }

    const results = cardData.filter(card => {
        const title = card.title.toLowerCase(); // 카드 제목을 소문자로 변환
        return query.every(word => title.includes(word)); // 모든 검색어 단어가 제목에 포함되어 있는지 확인
    });

    // 페이징에 맞춰서 결과 표시
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const pageResults = results.slice(startIndex, endIndex);

    const totalPages = Math.ceil(results.length / resultsPerPage);
    createPagination(totalPages);

    if (pageResults.length === 0) {
        resultsContainer.innerHTML = '<p>결과 못찾았어용용</p>';
    } else {
        pageResults.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            cardDiv.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${card.title}</div>
                    <div class="card-rarity">${card.rarity}</div>
                </div>
                <div class="card-body">
                    <div><strong>레벨:</strong> ${card.level}</div>
                    <div><strong>파워:</strong> ${card.power}</div>
                    <div><strong>소울:</strong> ${card.soul}</div>
                    <div><strong>코스트:</strong> ${card.cost}</div>
                    <div><strong>색:</strong> ${card.color}</div>
                    <div><strong>특징:</strong> ${card.features}</div>
                    <div><strong>플레이버:</strong> ${card.flavor}</div>
                    <div><strong>효과:</strong> ${addLineBreaks(card.effect)}</div>
                </div>
            `;
            resultsContainer.appendChild(cardDiv);
        });
    }

    if (!started) {
        window.scrollTo(0, document.body.scrollHeight);
    }
}

// 페이지 버튼 생성
// function createPagination(totalPages) {
//     const paginationContainer = document.getElementById('pagination');
//     paginationContainer.innerHTML = '';
    
//     // 페이지 버튼이 없으면 생성하지 않음
//     if (totalPages <= 1) return;

//     // 이전 페이지 버튼
//     if (currentPage > 1) {
//         const prevButton = document.createElement('button');
//         prevButton.textContent = '이전';
//         prevButton.onclick = () => changePage(currentPage - 1);
//         paginationContainer.appendChild(prevButton);
//     }

//     // 페이지 번호 버튼
//     for (let i = 1; i <= totalPages; i++) {
//         const pageButton = document.createElement('button');
//         pageButton.textContent = i;
//         pageButton.onclick = () => changePage(i);
//         if (i === currentPage) {
//             pageButton.disabled = true; // 현재 페이지는 클릭할 수 없게 비활성화
//         }
//         paginationContainer.appendChild(pageButton);
//     }

//     // 다음 페이지 버튼
//     if (currentPage < totalPages) {
//         const nextButton = document.createElement('button');
//         nextButton.textContent = '다음음';
//         nextButton.onclick = () => changePage(currentPage + 1);
//         paginationContainer.appendChild(nextButton);
//     }
// }
function createPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // 페이지 버튼이 없으면 생성하지 않음
    if (totalPages <= 1) return;

    // 이전 페이지 버튼
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '이전';
        prevButton.onclick = () => changePage(currentPage - 1);
        paginationContainer.appendChild(prevButton);
    }

    // 페이지 번호 버튼
    let startPage, endPage;

    // 페이지 범위 고정
    if (totalPages <= 4) {
        startPage = 1;
        endPage = totalPages;
    } else {
        if (currentPage <= 2) {
            startPage = 1;
            endPage = 4;
        } else if (currentPage >= totalPages - 1) {
            startPage = totalPages - 3;
            endPage = totalPages;
        } else {
            startPage = currentPage - 1;
            endPage = currentPage + 2;
        }
    }

    // 첫 번째 페이지와 '...' 표시
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.textContent = '1';
        firstPageButton.onclick = () => changePage(1);
        paginationContainer.appendChild(firstPageButton);

        // '...' 버튼 추가
        const dotsButton = document.createElement('button');
        dotsButton.textContent = '...';
        dotsButton.onclick = () => {
            // 사용자에게 입력을 요청
            const pageNumber = prompt(`페이지를 입력해주세요 (1-${totalPages}):`);
            const pageNum = parseInt(pageNumber, 10);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                changePage(pageNum);
            } else {
                // alert('존재하지 않는 페이지 번호입니다');
            }
        };
        paginationContainer.appendChild(dotsButton);
    }

    // 중간 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => changePage(i);
        if (i === currentPage) {
            pageButton.disabled = true; // 현재 페이지는 클릭할 수 없게 비활성화
        }
        paginationContainer.appendChild(pageButton);
    }

    // '...' 버튼과 마지막 페이지
    if (endPage < totalPages) {
        // '...' 버튼 추가
        const dotsButton = document.createElement('button');
        dotsButton.textContent = '...';
        dotsButton.onclick = () => {
            // 사용자에게 입력을 요청
            const pageNumber = prompt(`페이지를 입력해주세요 (1-${totalPages}):`);
            const pageNum = parseInt(pageNumber, 10);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                changePage(pageNum);
            } else {
                // alert('존재하지 않는 페이지 번호입니다');
            }
        };
        paginationContainer.appendChild(dotsButton);

        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.onclick = () => changePage(totalPages);
        paginationContainer.appendChild(lastPageButton);
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '다음';
        nextButton.onclick = () => changePage(currentPage + 1);
        paginationContainer.appendChild(nextButton);
    }
}

// 페이지 변경 함수
function changePage(page) {
    currentPage = page;
    search();
}