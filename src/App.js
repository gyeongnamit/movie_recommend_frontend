// 로고 이미지와 스타일시트 가져오기 (화면 디자인과 로고 설정)
import logo from './logo.svg'; // 로고 이미지 파일 불러오기
import './App.css'; // CSS 파일로 스타일 적용하기

// React의 기능과 axios 라이브러리 가져오기
import React, { useEffect, useState } from "react"; // React의 기본 기능과 훅(hook) 기능 불러오기
import axios from "axios"; // 서버와 데이터를 주고받기 위한 라이브러리

// App 컴포넌트 정의 (웹 페이지의 핵심 부분)
function App() {
  // 상태(state) 정의: 웹 페이지에서 필요한 데이터를 저장하고 관리
  const [latestMovies, setLatestMovies] = useState([]); // 최신 영화 정보를 저장할 변수, 초기값은 빈 배열([])
  const [popularMovies, setPopularMovies] = useState([]); // 인기 영화 정보를 저장할 변수, 초기값은 빈 배열([])
  const [recommendedMovies, setRecommendedMovies] = useState([]); // 추천 영화 정보를 저장할 변수, 초기값은 빈 배열([])
  const [selectedMovie, setSelectedMovie] = useState(null); // 사용자가 선택한 영화를 저장할 변수, 초기값은 null(선택 없음)

  // 페이지가 처음 열릴 때(로딩 시) 실행되는 코드
  useEffect(() => {
    // 최신 영화 불러오기 (서버에 요청)
    axios.get("/movie/movie_latest") // 서버의 '/movie/movie_latest' 주소에 최신 영화 데이터 요청
      .then((response) => { // 데이터 요청 성공 시 실행
        console.log("latest", response.data); // 서버에서 받은 최신 영화 데이터 콘솔에 출력
        setLatestMovies(response.data); // 최신 영화 데이터를 상태 변수에 저장
      });

    // 인기 영화 불러오기 (서버에 요청)
    axios.get("/movie/movie_popular") // 서버의 '/movie/movie_popular' 주소에 인기 영화 데이터 요청
      .then((response) => { // 데이터 요청 성공 시 실행
        console.log("popular", response.data); // 서버에서 받은 인기 영화 데이터 콘솔에 출력
        setPopularMovies(response.data); // 인기 영화 데이터를 상태 변수에 저장
      });
  }, []); // 빈 배열([])을 전달하면, 페이지가 처음 로딩될 때만 실행됨

  // 하트 아이콘 클릭 시 추천 영화 가져오기 (비동기 함수)
  const handleHeartClick = async (movieTitle) => {
    if (selectedMovie === movieTitle) { // 이미 선택된 영화를 다시 클릭한 경우
      setSelectedMovie(null); // 선택 해제 (null로 설정)
      setRecommendedMovies([]); // 추천 영화 목록 초기화 (빈 배열로 설정)
    } else { // 새로운 영화를 선택한 경우
      try {
        setSelectedMovie(movieTitle); // 선택된 영화 제목을 상태에 저장

        // 선택된 영화와 비슷한 영화 추천 요청 (서버에 POST 방식으로 전송)
        const recommendResponse = await axios.post("/movie/movie_recommend", { title: movieTitle });
        const recommendedTitles = recommendResponse.data; // 서버에서 추천 영화 제목 리스트 받기

        // 추천 영화의 상세 정보를 가져오기 위한 추가 요청
        const detailedMovies = await Promise.all(
          recommendedTitles.map(async (title) => { // 추천된 각 영화 제목에 대해 요청 실행
            const detailResponse = await axios.post("/movie/get_movie", { title }); // 영화 상세 정보 요청
            return detailResponse.data; // 영화 상세 정보 반환
          })
        );

        setRecommendedMovies(detailedMovies); // 추천 영화 목록을 상태에 저장
      } catch (error) { // 오류 발생 시 처리
        console.error("추천 영화 정보를 가져오는 중 오류 발생:", error); // 오류 메시지 콘솔에 출력
      }
    }
  };

  // 실제 화면 구성 (HTML 구조와 비슷)
  return (
    <div className="App"> {/* 전체 화면을 감싸는 태그 */}
      <h1>Movies</h1> {/* 페이지 제목 */}

      {/* 최신 영화 섹션 */}
      <section>
        <h2>Latest Movies</h2> {/* 섹션 제목 */}
        <div className="movie-grid"> {/* 영화 목록을 담는 그리드 레이아웃 */}
          {latestMovies.map((movie) => ( // 최신 영화 목록 반복 출력
            <div key={movie.num} className="movie-card"> {/* 각 영화 카드 */}
              <img src={movie.poster} alt={movie.title} className="poster" /> {/* 영화 포스터 이미지 */}
              <div className="movie-info"> {/* 영화 정보 영역 */}
                <h3>{movie.title}</h3> {/* 영화 제목 출력 */}
                <img
                  src={
                    selectedMovie === movie.title
                      ? "/images/heart-filled.png" // 선택된 경우 하트가 채워진 이미지
                      : "/images/heart-outline.png" // 선택되지 않은 경우 빈 하트 이미지
                  }
                  alt="heart" // 이미지 설명
                  className="heart-icon" // 아이콘 스타일 적용
                  onClick={() => handleHeartClick(movie.title)} // 클릭 이벤트 설정
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 인기 영화 섹션 */}
      <section>
        <h2>Popular Movies</h2> {/* 인기 영화 섹션 제목 */}
        <div className="movie-grid"> {/* 인기 영화 목록을 보여주는 그리드 */}
          {popularMovies.map((movie) => ( // 인기 영화 목록 반복 출력
            <div key={movie.num} className="movie-card"> {/* 각 영화 카드 */}
              <img src={movie.poster} alt={movie.title} className="poster" /> {/* 영화 포스터 이미지 */}
              <div className="movie-info">
                <h3>{movie.title}</h3> {/* 영화 제목 */}
                <img
                  src={
                    selectedMovie === movie.title
                      ? "/images/heart-filled.png" // 선택된 경우 채워진 하트
                      : "/images/heart-outline.png" // 선택되지 않은 경우 빈 하트
                  }
                  alt="heart"
                  className="heart-icon"
                  onClick={() => handleHeartClick(movie.title)} // 하트 클릭 이벤트 설정
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 추천 영화 섹션 */}
      <section>
        {selectedMovie && ( // 선택된 영화가 있을 경우만 표시
          <>
            <h2>{`"${selectedMovie}"를 좋하하는 당신에게 추천하는 영화`}</h2> {/* 선택된 영화와 비슷한 영화 제목 */}
            <div className="movie-grid"> {/* 추천 영화 목록 */}
              {recommendedMovies.map((movie, index) => (
                <div key={index} className="movie-card"> {/* 추천 영화 카드 */}
                  <img src={movie.poster} alt={movie.title} className="poster" /> {/* 영화 포스터 */}
                  <div className="movie-info">
                    <h3>{movie.title}</h3> {/* 추천 영화 제목 */}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// 이 컴포넌트를 다른 곳에서 사용할 수 있도록 내보내기
export default App;