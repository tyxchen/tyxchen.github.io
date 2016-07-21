document.onreadystatechange = () => {
    if (document.readyState === "complete") document.querySelector("body").classList.add("ready");
};
