document.onreadystatechange = function () {
    if (document.readyState === "complete")
        document.querySelector("body").classList.add("ready");
};
