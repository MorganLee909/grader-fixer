let start = ()=>{
    let currentPage = window.location.href;

    const applyStyle = ()=>{
        const style = `
            .gradeDisplay{
                color: green;
                font-weight: bold;
            }
            .rubricFrame{
                width: 100%;
            }
            .rubricFrame span{
                font-size: 12px;
            }
            #downloadGraded{
                height: 50%;
                background: green;
                border: none;
                z-index: 999;
                cursor: pointer;
                color: white;
                padding: 5px;
                margin: auto 0;
                box-shadow: 0 0 5px black;
            }
        `;

        let styleElem = document.createElement("style");
        styleElem.textContent = style;
        document.body.appendChild(styleElem);
    }

    const downloadGraded = ()=>{
        let button = document.createElement("button");
        button.textContent = "Download Graded";
        button.id = "downloadGraded";
        let header = document.querySelector(".ui.top.fixed.menu").children[0];
        header.insertBefore(button, header.children[1]);

        button.addEventListener("click", ()=>{
            let header = "urlId,module,grade,timestamp\n";

            let graded = localStorage.getItem("graded");
            graded = graded ? graded : "";
            let file = new Blob([header, graded]);
            let a = document.createElement("a");
            let url = URL.createObjectURL(file);
            a.href = url;
            a.download = "gradedAssignments.csv";
            document.body.appendChild(a);
            a.click();
        });
    }

    const handlePage = ()=>{
        if(currentPage.includes("canvasSubmission")) submissionPage.run();
        if(currentPage.includes("claimed")) claimedPage.run();
    }

    setInterval(()=>{
        let newUrl = window.location.href;
        if(newUrl !== currentPage){
            currentPage = newUrl;
            handlePage();
        }
    }, 250);

    let wait = setInterval(()=>{
        try{
            document.querySelector(".ui.top.fixed.menu");
            clearInterval(wait);
            downloadGraded();
        }catch(e){}
    }, 100);

    handlePage();
    applyStyle();
}

start();