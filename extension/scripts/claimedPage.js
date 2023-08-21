let claimedPage = {
    ungraded: [],
    waitingReview: [],
    pastDue: [],
    clonableAssCard: document.createElement("div"),

    run: function(){
        let container = null;
        let uiGrid = null;
        let newContainer = document.createElement("div");
        this.clonableAssCard.innerHTML = '<div style="padding: 10px; border: 1px solid rgb(222, 222, 223); border-radius: 5px;" class="item queue-item canvas"><div style="position: relative;" class="content"><a href="https://grading.bootcampspot.com/canvasSubmission/820697"><div style="font-size: 20px; font-weight: bold; color: black; width: 50%;" class="header">Module 21 Challenge</div></a><div style="display: flex; flex-direction: row-reverse; align-items: center;"><div style="margin-right: 10px; margin-top: -1.5em;"></div></div><div class="description"><div class="ui grid"><div class="six wide computer sixteen wide mobile six wide tablet column"><p>In Progress</p><p>2023-08-18T02:13:46.947976Z</p><p>2023-08-18T04:59:59Z</p><p>Full Stack Flex</p></div><div class="six wide computer sixteen wide mobile six wide tablet column"><p>Cotton, Gage</p><p>UTA-VIRT-FSF-PT-03-2023-U-LOLC-MWTH(A)</p></div></div></div><a style="bottom: 0px; right: 0px; position: absolute;" class="ui grey button" role="button" href="https://grading.bootcampspot.com/canvasSubmission/820697"><i class="right arrow icon"></i></a></div></div>';
        this.clonableAssCard = this.clonableAssCard.firstChild;

        let wait = setInterval(()=>{
            try{
                uiGrid = document.querySelector(".ui.grid");
                container = uiGrid.children[1];
            }catch(e){}

            if(container !== null){
                clearInterval(wait);
                container.style.display = "none";

                //Create and modify new container
                newContainer = container.cloneNode(true);
                let menu = newContainer.querySelector(".ui.secondary.menu");

                for(let i = 0; i < menu.children.length; i++){
                    menu.children[i].addEventListener("click", ()=>{
                        for(let j = 0; j < menu.children.length; j++){
                            menu.children[j].classList.remove("active");
                        }

                        let data = [];
                        switch(i){
                            case 0: data = this.ungraded; break;
                            case 1: data = this.pastDue; break;
                            case 2: data = this.waitingReview; break;
                        }

                        menu.children[i].classList.add("active");
                        this.displayAssignments(data, newContainer);
                    });
                }

                newContainer.style.display = "block";
                uiGrid.appendChild(newContainer);
                this.getClaimed(newContainer);
            }
        }, 100);
    },

    getClaimed: function(container){
        fetch("https://grading.bootcampspot.com/api/centralgrading/v1/myClaimedSubmissions", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                offset: 0,
                resultsPerPage: 500,
                role: {
                    id: 1,
                    name: "Central Grader"
                }
            })
        })
            .then(r=>r.json())
            .then((response)=>{
                this.ungraded = [];
                this.waitingReview = [];
                this.pastDue = [];
                for(let i = 0; i < response.data.length; i++){
                    let status = response.data[i].status;
                    if(status === "In Progress"){
                        this.ungraded.push(response.data[i]);
                    }else if(status === "Ready for Review" || status === "Flagged"){
                        this.waitingReview.push(response.data[i]);
                    }else{
                        this.pastDue.push(response.data[i]);
                    }
                }

                this.displayAssignments(this.ungraded, container);
            })
            .catch((err)=>{
                console.error(err);
            });
    },

    displayAssignments: function(assignments, container){
        let assCardContainer = container.querySelector(".ui.items");

        while(assCardContainer.children.length > 0){
            assCardContainer.removeChild(assCardContainer.lastChild);
        }
        for(let i = 0; i < assignments.length; i++){
            let newCard = this.createAssCard(assignments[i]);
            assCardContainer.appendChild(newCard);
        }

        try{
            document.querySelector(".ui.pagination.menu").style.display = "none";
        }catch(e){}
    },

    createAssCard: function(data){
        let newCard = this.clonableAssCard.cloneNode(true);

        let header = newCard.querySelector(".header");
        header.textContent = data.assignmentName;
        header.parentElement.href = `https://grading.bootcampspot.com/canvasSubmission/${data.id}`;

        let descContainerLeft = newCard.querySelector(".description > .ui.grid").children[0];
        descContainerLeft.children[0].textContent = data.status;
        descContainerLeft.children[1].textContent = data.date;
        descContainerLeft.children[2].textContent = data.assignmentDueDate;
        descContainerLeft.children[3].textContent = data.program.name;

        let descContainerRight = newCard.querySelector(".description > .ui.grid").children[1];
        descContainerRight.children[0].textContent = data.studentName;
        descContainerRight.children[1].textContent = data.course.name;

        newCard.querySelector(".ui.grey.button").href = `https://grading.bootcampspot.com/canvasSubmission/${data.id}`;

        return newCard;
    }
}