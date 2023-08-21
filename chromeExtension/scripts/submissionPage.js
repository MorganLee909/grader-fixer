let submissionPage = {
    run: function(){
        this.getAssignmentData();

        let loadedInterval = setInterval(()=>{
            if(document.querySelectorAll(".ui.header").length > 0){
                clearInterval(loadedInterval);
                this.addRubric();
                this.addSaveAssignment();
            }
        }, 100);
    },

    getAssignmentData: function(){
        let submissionId = window.location.pathname.split("/");
        submissionId = Number(submissionId[submissionId.length-1]);

        fetch("https://grading.bootcampspot.com/api/centralgrading/v1/submissionDetail", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                role: {
                    id: 1,
                    name: "Central Grader"
                },
                submissionId: submissionId
            })
        })
            .then(r=>r.json())
            .then((response)=>{
                let interval = setInterval(()=>{
                    if(document.querySelectorAll(".ui.header").length > 0){
                        clearInterval(interval);
                        let uiComments = document.querySelectorAll(".ui.comments .comment");
                        let commentIndex = 0;
                        let gradeIndex = 0;

                        for(let i = 0; i < response.data.length; i++){
                            if(response.data[i].key === "Comment"){
                                if(response.data[i].children[1].content === "Central Grader"){
                                    this.addGrade(response.relatedSubmissions[gradeIndex].grade, uiComments[commentIndex].querySelector(".metadata"));
                                    gradeIndex++;
                                }

                                this.rewriteText(uiComments[commentIndex].querySelector(".text"), response.data[i].content);
                                commentIndex++;
                            }
                        }
                    }
                }, 100)
            })
            .catch((err)=>{
                console.error(err);
            });
    },

    addGrade: function(grade, metadataElem){
        let p = document.createElement("p");
        p.classList.add("gradeDisplay");
        p.textContent = `Grade: ${grade.grade} / 100`;
        metadataElem.appendChild(p);
    },

    addRubric: function(){
        let main = document.querySelector(".divided.equal.width.row");
        let module = main.querySelector("h2");
        let rubricElem = main.children[1].children[0].children[3];
        let container = document.querySelector(".ui.segment.active.tab");

        module = Number(module.textContent.split(" ")[1]);

        let frame = document.createElement("iframe");
        frame.classList.add("rubricFrame");
        frame.src = `https://leemorgan.io/2u/rubrics/${module}`;
        frame.style.height = `${container.clientHeight}px`;
        rubricElem.appendChild(frame);
    },

    rewriteText: function(textElem, content){
        textElem.textContent = "";
        let splitContent = content.split("\n");

        for(let j = 0; j < splitContent.length; j++){
            let p = document.createElement("p");
            p.textContent = splitContent[j];
            textElem.appendChild(p);
        }
    },

    addSaveAssignment: function(){
        let button = document.querySelector(".ui.green.icon.positive.right.labeled.button");
        button.addEventListener("click", ()=>{
            let info = document.querySelector(".divided.equal.width.row").children[1].children[0].children[1];

            let url = window.location.href.split("/");
            url = url[url.length-1];

            let module = info.children[0].innerText;
            module = module.split(" ");
            module = module[1];

            let grade = "";
            let gradeOptions = document.querySelectorAll(".ui.toggle.checkbox input");
            if(gradeOptions[0].checked){
                grade = "plagiarism";
            }else if(gradeOptions[1].checked){
                grade = "incomplete";
            }else{
                grade = document.querySelector(".gradeInputBoxForCanvas").children[0].value;
            }

            let time = new Date();
            time = time.toISOString();

            let graded = localStorage.getItem("graded");
            graded = graded ? graded : "";
            graded += `${url},${module},${grade},${time}\n`;

            localStorage.setItem("graded", graded);
        });
    }
}