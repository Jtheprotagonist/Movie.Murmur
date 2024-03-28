import React, { useState, useEffect } from "react";
import { MovieCard } from "../movie-card/movie-card";
import MovieView from "../movie-view/movie-view";
import SignupView from "../signup-view/signup-view";
import LoginView from "../login-view/login-view"; // Import LoginView component

const MainView = () => {
  const [movies, setMovies] = useState([]); // State variable to store movies
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // State variable to store user
  const [isLoading, setIsLoading] = useState(true); // State variable for loading state

  useEffect(() => {
    fetch('https://movie-murmer-2015-5d256703e312.herokuapp.com/movies')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then((data) => {
        setMovies(data);
        setIsLoading(false); // Set loading state to false after fetching movies
      })
      .catch((error) => {
        setIsLoading(false); // Set loading state to false if there's an error
        // Handle the error, e.g., display a message to the user
      });
  }, []);

  const handleLogout = () => {
    // Perform logout logic here
    // Example: Clear authentication token, reset user session, etc.
  };

  const handleCardClick = (clickedMovie) => {
    setSelectedMovie(clickedMovie);
  };

  const handleBackButtonClick = () => {
    setSelectedMovie(null);
  };

  if (selectedMovie) {
    return <MovieView onBackButtonClick={handleBackButtonClick} movie={selectedMovie} />;
  }

  // Render loading message if movies are still being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render movie cards if movies are available
  if (movies.length > 0) {
    return (
      <div>
        {/* Logout button */}
        <button onClick={() => { setUser(null); setToken(null); localStorage.clear(); }}>Logout</button>
  
        {movies.map((movie) => (
          <MovieCard
            key={movie._id} // Assuming the id property is named "_id", adjust if necessary
            movie={{...movie, id: movie._id}} // Ensure that the "id" property is included in the movie object
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    );
  }

  // Render login or signup view if user is not logged in
  if (!user) {
    return (
      <>
        <LoginView onLoggedIn={(user, token) => {
          setUser(user);
          setToken(token);
        }} />
        or
        <SignupView />
      </>
    );
  }

  // If none of the above conditions are met, render default message
  return <div>The list is empty!</div>;
};

export default MainView;
