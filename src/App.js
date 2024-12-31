import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [latestMovies, setLatestMovies] = useState([]); // 최신 영화 저장
  const [popularMovies, setPopularMovies] = useState([]); // 인기 영화 저장
  const [recommendedMovies, setRecommendedMovies] = useState([]); // 추천 영화 저장
  const [selectedMovie, setSelectedMovie] = useState(null); // 선택된 영화

  // 처음 화면 로드 시 최신 영화와 인기 영화 가져오기
  useEffect(() => {
    // 최신 영화 가져오기
    axios.get("/movie/movie_latest").then((response) => {
      console.log("latest", response.data);
      setLatestMovies(response.data);
    });

    // 인기 영화 가져오기
    axios.get("/movie/movie_popular").then((response) => {
      console.log("popular", response.data);
      setPopularMovies(response.data);
    });
  }, []);

  // 하트 클릭 시 추천 영화 가져오기
  const handleHeartClick = async (movieTitle) => {
    if (selectedMovie === movieTitle) {
      // 이미 선택된 경우 선택 해제
      setSelectedMovie(null);
      setRecommendedMovies([]);
    } else {
      try {
        // 선택된 영화 설정
        setSelectedMovie(movieTitle);

        // 추천 영화 요청
        const recommendResponse = await axios.post("/movie/movie_recommend", { title: movieTitle });
        const recommendedTitles = recommendResponse.data;

        // 각 추천 영화 제목으로 상세 정보 가져오기
        const detailedMovies = await Promise.all(
          recommendedTitles.map(async (title) => {
            const detailResponse = await axios.post("/movie/get_movie", { title });
            return detailResponse.data;
          })
        );

        // 추천 영화 정보를 상태에 저장
        setRecommendedMovies(detailedMovies);
      } catch (error) {
        console.error("Error fetching recommended movies:", error);
      }
    }
  };

  return (
    <div className="App">
      <h1>Movies</h1>

      <section>
        <h2>Latest Movies</h2>
        <div className="movie-grid">
          {latestMovies.map((movie) => (
            <div key={movie.num} className="movie-card">
              <img src={movie.poster} alt={movie.title} className="poster" />
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <img
                  src={
                    selectedMovie === movie.title
                      ? "/images/heart-filled.png" // 하트 선택된 상태
                      : "/images/heart-outline.png" // 하트 선택되지 않은 상태
                  }
                  alt="heart"
                  className="heart-icon"
                  onClick={() => handleHeartClick(movie.title)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Popular Movies</h2>
        <div className="movie-grid">
          {popularMovies.map((movie) => (
            <div key={movie.num} className="movie-card">
              <img src={movie.poster} alt={movie.title} className="poster" />
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <img
                  src={
                    selectedMovie === movie.title
                      ? "/images/heart-filled.png"
                      : "/images/heart-outline.png"
                  }
                  alt="heart"
                  className="heart-icon"
                  onClick={() => handleHeartClick(movie.title)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        {selectedMovie && (
          <>
            <h2>{`"${selectedMovie}"와 비슷한 영화`}</h2>
            <div className="movie-grid">
              {recommendedMovies.map((movie, index) => (
                <div key={index} className="movie-card">
                  <img src={movie.poster} alt={movie.title} className="poster" />
                  <div className="movie-info">
                    <h3>{movie.title}</h3>
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

export default App;