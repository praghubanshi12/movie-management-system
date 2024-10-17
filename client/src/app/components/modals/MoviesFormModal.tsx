import { formModes } from '@/app/const/const';
import { MoviesContext } from '@/app/context/MoviesContext';
import useMoviesApiHandler from '@/app/custom-hooks/useMoviesApiHandler';
import useMoviesModalHandler from '@/app/custom-hooks/useMoviesModalHandler';
import { allowedImageTypes, maxAllowedImageSizeInMb, toBase64 } from '@/app/helper-functions/ImageHelper';
import React, { useContext } from 'react';
import { toast } from 'sonner';

export default function MoviesFormModal() {
    const { movies, setMovies, movieFormDetails, setMovieFormDetails } = useContext<any>(MoviesContext);
    const { addOrEditMovie } = useMoviesApiHandler();
    const { hideMovieFormModal } = useMoviesModalHandler();

    const handleSubmitMovieForm = async (e: any) => {
        if (e) e.preventDefault();
        const addOrEditMovieResponse = await addOrEditMovie();
        console.log(addOrEditMovieResponse)
        if (!!!addOrEditMovieResponse) return;
        if (movieFormDetails.mode == formModes.CREATE_MODE) {
            setMovies([
                addOrEditMovieResponse.data,
                ...movies
            ]);
        }
        else if (movieFormDetails.mode == formModes.EDIT_MODE) {
            let updatedMovies = [...movies];
            let updatedData = updatedMovies.find(movie => movie.id == addOrEditMovieResponse.data.id);
            if (!!!updatedData) return;

            updatedData.movie_name = addOrEditMovieResponse.data.movie_name;
            updatedData.genre = addOrEditMovieResponse.data.genre;
            updatedData.year_of_release = addOrEditMovieResponse.data.year_of_release;
            updatedData.link_to_movie_image = addOrEditMovieResponse.data.link_to_movie_image;
            setMovies(updatedMovies);
        }
        /* wait for state update first */
        hideMovieFormModal();
        toast.success(addOrEditMovieResponse.message, { position: 'top-right' });
    }

    const handleInputChange = async (e: any) => {
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
                    toast.error('Only jpeg, png, svg, webp extension files are accepted', { position: 'top-right' });
                    break;
                }
                if ((e.target.files[0].size / (1024 * 1024)) > maxAllowedImageSizeInMb) {
                    e.preventDefault();
                    toast.error(`Max upload size is ${maxAllowedImageSizeInMb}MB`, { position: 'top-right' });
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
                }).catch(err => toast.error("Error Loading Image", { position: 'top-right' }))
                break;

            default:
                break;
        }
    }

    return (
        <div
            className="modal fade"
            id="movieFormModal"
            tabIndex={-1}
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
                                <label>Title <span className='text-danger'>*</span></label>
                                <input type="text" name="movie_name" className="form-control" required
                                    minLength={2} maxLength={255} value={movieFormDetails?.data.movie_name} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Genre <span className='text-danger'>*</span></label>
                                <input type="text" name="genre" className="form-control" required
                                    minLength={2} maxLength={255} value={movieFormDetails?.data.genre} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Year <span className='text-danger'>*</span></label>
                                <input type="number" name="year_of_release" className="form-control" required
                                    min={1000} max={2100} value={movieFormDetails?.data.year_of_release || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Image</label>
                                <input type="file" name="image" accept="image/png, image/jpeg, image/svg, image/webp" className="form-control"
                                    onChange={handleInputChange} />
                                <img src={movieFormDetails.data.image?.base64} height="150" width="150"
                                    style={{ display: `${!!movieFormDetails.data.image?.base64 ? 'block' : 'none'}` }} />
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
