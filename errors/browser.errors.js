function browserCreationError(error){
    console.log("errors.couldNotCreateBrowser",error);
}

function newPageCreationError(error){
    console.log("errors.couldNotCreateNewPage",error);
}

function openPageError(url,error){
    console.log("errors.couldNotOpenPage",url,error);
}

function getValueError(url,error){
    console.log("errors.couldNotGetValue",url,error);
}

module.exports = {
    browserCreationError,
    newPageCreationError,
    openPageError,
    getValueError,
}
