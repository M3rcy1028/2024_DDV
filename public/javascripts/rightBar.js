const recentProductsList = document.getElementById('recent-products');

// 최근 본 상품을 사이드바에 표시하는 함수
function loadRecentProducts() {
    const VISITED_KEY = "visitedProducts";

    const viewedProducts = JSON.parse(localStorage.getItem(VISITED_KEY)) || [];

    if (viewedProducts.length === 0) {
        recentProductsList.innerHTML = '<p>최근 본 상품이 없습니다 : (</p>';
        return;
    }
    else {
        $.ajax({
            url: '/recentProduct',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ products: viewedProducts }),
            success: function (response) {
                console.log('서버로 데이터 전송 성공:', response.results);

                recentProductsList.innerHTML = '';

                const result = response.results;
                result.forEach(product => {
                    console.log(product);
                    const productItem = document.createElement('div');
                    productItem.classList.add('product-item');

                    //링크
                    const link = document.createElement('a');
                    link.href = '/sellBoard/sellRead/' + product.Bno;

                    //상품 번호와 이미지 표시
                    const productImage = document.createElement('img');
                    productImage.src = product.Img;  // 서버에서 받은 이미지 경로 사용
                    productImage.style.width = '100px';
                    productImage.alt = `상품 ID: ${product.Bno}`;

                    link.appendChild(productImage);

                    // 상품 항목에 이미지와 텍스트를 추가
                    productItem.appendChild(link);

                    // 상품 항목을 리스트에 추가
                    recentProductsList.appendChild(productItem);
                });
            },
            error: function (xhr, status, error) {
                console.error('서버로 데이터 전송 실패:', error);
            }
        });
    }
}

window.addEventListener('scroll', function () {
    var sidebar = document.getElementById('right-sidebar');
    var scrollPosition = window.scrollY;

    // 사이드바가 화면 상단에 고정되도록 설정
    if (scrollPosition > 200) {  // 스크롤 위치가 100px 이상일 때
        sidebar.style.top = '100px';
    } else {
        sidebar.style.top = '200px';
    }
});

window.addEventListener("load", () => {
    loadRecentProducts();
});