import { hideMovieFormModal } from '@/app/bootstrap-modal-toggler/form-modal-helper';
import { formModes } from '@/app/const/const';
import { MoviesContext } from '@/app/context/MoviesContext';
import React, { useContext, useEffect } from 'react'

const allowedImageTypes = ['image/png', 'image/jpeg', 'image/svg', 'image/webp'];

const toBase64 = (file: any) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

export default function MoviesFormModalCopy() {
    const { movies, setMovies, movieFormDetails, setMovieFormDetails } = useContext<any>(MoviesContext);
    const handleSubmitMovieForm = (e: any) => {
        if (e) e.preventDefault();
        const formData  = new FormData();
        let formBodyJSON = {
            ...movieFormDetails.data,
            image: movieFormDetails.data.image.value
        }

        for ( var key in formBodyJSON ) {
            formData.append(key, formBodyJSON[key]);
        }
        const requestOptions = {
            method: movieFormDetails.mode,
            body: formData
        };

        let additionalFormChangeUrl = movieFormDetails.mode == formModes.EDIT_MODE ? `/${formBodyJSON.id}` : '';
        fetch(`http://localhost:8000/movies.php${additionalFormChangeUrl}`, requestOptions)
            .then(response => response.json())
            .then(resp => {
                if (movieFormDetails.mode == formModes.CREATE_MODE) {
                    setMovies([
                        resp.data,
                        ...movies
                    ]);
                }
                else if (movieFormDetails.mode == formModes.EDIT_MODE) {
                    let updatedMovies = [...movies];
                    let updatedData = updatedMovies.find(movie => movie.id == resp.data.id);
                    if (!!!updatedData) return;

                    updatedData.movie_name = resp.data.movie_name;
                    updatedData.genre = resp.data.genre;
                    updatedData.year_of_release = resp.data.year_of_release;
                    updatedData.link_to_movie_image = resp.data.link_to_movie_image;
                    setMovies(updatedMovies);
                }
            /* wait for state update first */hideMovieFormModal();
            });
    }

    const handleInputChange = async (e) => {
        switch (e.target.type) {
            case 'text':
            case 'number':
                setMovieFormDetails({
                    ...movieFormDetails,
                    data: {
                        ...movieFormDetails?.data,
                        [e.target.name]: e.target.value
                    }
                })
                break;

            case 'file':
                if (!allowedImageTypes.includes(e.target.files[0].type)) {
                    e.preventDefault();
                    alert('Only jpeg, png, svg, webp extension files are accepted');
                    break;
                }
                if ((e.target.files[0].size / (1024 * 1024)) > 2) {
                    e.preventDefault();
                    alert('Max upload size is 2MB');
                    break;
                }

                toBase64(e.target.files[0]).then(base64Image => {
                    setMovieFormDetails({
                        ...movieFormDetails,
                        data: {
                            ...movieFormDetails?.data,
                            [e.target.name]: {
                                value: e.target.files[0],
                                base64: base64Image
                            }
                        }
                    })
                }).catch(err => alert('Error Loading Image'))
                break;

            default:
                break;
        }
    }

    return (
        <div
            className="modal fade"
            id="movieFormModal"
            tabIndex="-1"
            aria-labelledby="movieFormModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="movieFormModalLabel">
                            Add/Edit Movie
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <form onSubmit={handleSubmitMovieForm}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" name="movie_name" className="form-control" required
                                    minLength={2} maxLength={255} value={movieFormDetails?.data.movie_name} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Genre</label>
                                <input type="text" name="genre" className="form-control" required
                                    minLength={2} maxLength={255} value={movieFormDetails?.data.genre} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <input type="number" name="year_of_release" className="form-control" required
                                    min={1000} max={2100} value={movieFormDetails?.data.year_of_release} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Image</label>
                                <input type="file" name="image" accept="image/png, image/jpeg, image/svg, image/webp" className="form-control"
                                    onChange={handleInputChange} />
                                <img src={movieFormDetails.data.image?.base64} height="150" width="150" 
                                    style={{display : `${!!movieFormDetails.data.image?.base64 ? 'block' : 'none'}`}} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-success">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    )
}
