import React, { useState } from 'react'

export default function useMoviesPaginationHelper() {
    const [paginatedScrollingDetails, setPaginatedScrollingDetails] =
        useState({
            page: 1,
            loading: false,
            hasMore: true
        });

    const checkHasMoreIfScrolledToBottom = () => {
        return paginatedScrollingDetails.hasMore &&
            window.innerHeight + document.documentElement.scrollTop
            === document.documentElement.offsetHeight || paginatedScrollingDetails.loading;
    }

    const increasePageNumber = () => {
        setPaginatedScrollingDetails({
            ...paginatedScrollingDetails,
            page: paginatedScrollingDetails.page + 1
        })
    }

    const showPaginationScrollingLoadingBar = () => {
        setPaginatedScrollingDetails({
            ...paginatedScrollingDetails,
            loading: true
        });
    }

    const updatePaginationDetailsAfterDataLoad = (dataLength: number) => {
        setPaginatedScrollingDetails({
            ...paginatedScrollingDetails,
            hasMore: dataLength > 0,
            loading: false
        })
    }
    
    return {paginatedScrollingDetails, checkHasMoreIfScrolledToBottom, increasePageNumber, showPaginationScrollingLoadingBar, updatePaginationDetailsAfterDataLoad}
}
