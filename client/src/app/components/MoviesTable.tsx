import React, { useContext, useEffect, useState } from 'react'
import { Movie } from '../model/movie';
import { MoviesContext } from '../context/MoviesContext';
import { Toaster, toast } from 'sonner';
import useMoviesApiHandler from '../custom-hooks/useMoviesApiHandler';
import useMoviesPaginationHelper from '../custom-hooks/useMoviesPaginationHelper';
import useMoviesModalHandler from '../custom-hooks/useMoviesModalHandler';
import { SERVER_BASE_URL } from '../const/const';

interface imageLoadingStatusMap {
    [key: number] : boolean | undefined
}

export default function MoviesTable() {
    const { movies, setMovies } = useContext<any>(MoviesContext);
    const [hasDataFetchError, setHasDataFetchError] = useState(false);
    const { fetchMovies, deleteMovie } = useMoviesApiHandler();
    const {
        paginatedScrollingDetails,
        checkHasMoreIfScrolledToBottom,
        increasePageNumber,
        showPaginationScrollingLoadingBar,
        updatePaginationDetailsAfterDataLoad
    } = useMoviesPaginationHelper();
    const [imagesLoadingStatus, setImagesLoadingStatus] = useState<imageLoadingStatusMap>({});
    const { loadMoviesEditModalWithFormDetails } = useMoviesModalHandler();

    useEffect(() => {
        fetchData(paginatedScrollingDetails.page);
    }, [paginatedScrollingDetails.page]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [paginatedScrollingDetails.loading]);

    const handleScroll = () => {
        if (!checkHasMoreIfScrolledToBottom()) return;
        increasePageNumber();
    };

    const handleImageLoad = (movieId : number) => {
        // setTimeout(() => {
            setImagesLoadingStatus((prev) => ({...prev, [movieId]: false}));
        // }, 2000)
    }

    const fetchData = async (page: number) => {
        showPaginationScrollingLoadingBar();
        const fetchMoviesResponse = await fetchMovies(page);
        if (!!!fetchMoviesResponse.data) {
            setHasDataFetchError(true);
            return;
        }
        let updatedImagesLoadingStatus : imageLoadingStatusMap = {...imagesLoadingStatus};
        fetchMoviesResponse.data.forEach((movie: Movie) => {
            updatedImagesLoadingStatus[movie.id] = true;
        });
        // setTimeout(() =>
            // setImagesStatus(currentlyFetchedMovieImages);
            setMovies((prev: any) => [...prev, ...fetchMoviesResponse.data]);
            setImagesLoadingStatus(updatedImagesLoadingStatus);
            updatePaginationDetailsAfterDataLoad(fetchMoviesResponse.data.length);
        // }, 2000)
    };

    const handleMovieDelete = async (id: number) => {
        if (!!!id || id < 1) {
            toast.error("Something Went Wrong", { position: 'top-right' });
            return;
        }
        if (confirm("Are you sure?")) {
            const deleteMovieResponse = await deleteMovie(id);
            if (!!!deleteMovieResponse) return;
            let updatedMovies = [...movies];
            updatedMovies = updatedMovies.filter(movie => +movie.id !== +deleteMovieResponse.data.id);
            setMovies(updatedMovies);
            toast.success(deleteMovieResponse.message, { position: 'top-right' });
        }
    }

    const goToTopButton = document.getElementById('goToTop');

    if (!!goToTopButton) {
        // Show the button when the user scrolls down 100px
        window.onscroll = () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                goToTopButton.style.display = 'block';
            } else {
                goToTopButton.style.display = 'none';
            }
        };

        // Scroll to the top of the document
        goToTopButton.onclick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    return (
        <>
            <Toaster richColors />
            <table style={{ marginTop: '20px' }} className="table table-bordered" id="moviesTable">
                <thead>
                    <tr>
                        <th style={{width: "40%"}}>Title</th>
                        <th>Year</th>
                        <th>Genre</th>
                        <th>Image</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        movies.map((movie: Movie) => (
                            <tr key={movie.id}>
                                <td>{movie.movie_name}</td>
                                <td>{movie.year_of_release}</td>
                                <td>{movie.genre}</td>
                                <td>
                                    <img src={movie.link_to_movie_image} style={{ height: '150px', width: '150px', 
                                        filter: imagesLoadingStatus[movie.id] ? 'blur(2px)' : 'blur()'
                                    }}
                                        onLoad={ () => handleImageLoad(movie.id)}
                                        onError={({ currentTarget }) => {
                                            currentTarget.onerror = null;
                                            currentTarget.src = `${SERVER_BASE_URL}/uploads/placeholder.png`;
                                        }}
                                    />
                                </td>
                                <td>
                                    {<button type="button" className="btn btn-secondary" onClick={() => loadMoviesEditModalWithFormDetails(movie)}>Edit</button>}
                                    <button type="button" className="btn btn-danger" onClick={() => handleMovieDelete(movie.id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            {
                !paginatedScrollingDetails.loading && !hasDataFetchError && movies.length == 0 && <div>
                    No records found
                </div>
            }
            {
                !hasDataFetchError && paginatedScrollingDetails.loading && <div id="loading">
                    <div className="spinner"></div>
                    Loading.....
                </div>
            }
            {
                hasDataFetchError && <div>Error Fetching Data From Server</div>
            }
            <button id="goToTop" title="Go to top">↑</button>
        </>
    )
}
