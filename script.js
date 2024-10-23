document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("searchbutton");
    const usernameInput = document.getElementById("userinput");
    const cardStatsContainer = document.querySelector(".statscontainer");
    const easyProgressCircle = document.querySelector(".easyprogress");
    const mediumProgressCircle = document.querySelector(".mediumprogress");
    const hardProgressCircle = document.querySelector(".hardprogress");
    const easyLabel = document.getElementById("easylabel");
    const mediumLabel = document.getElementById("mediumlabel");
    const hardLabel = document.getElementById("hardlabel");

    // Validate username input
    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid username");
        }
        return isMatching;
    }

    // Fetch user details using GraphQL query
    async function fetchUserDetails(username) {
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = 'https://leetcode.com/graphql';
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const graphqlQuery = JSON.stringify({
            query: `
                query userSessionProgress($username: String!) {
                    allQuestionsCount {
                        difficulty
                        count
                    }
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                            totalSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                    }
                }`,
            variables: { username: username }
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: graphqlQuery,
            redirect: "follow"
        };

        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const response = await fetch(proxyUrl + targetUrl, requestOptions);

            if (!response.ok) {
                throw new Error("Unable to fetch the user data");
            }

            const parsedata = await response.json();
            console.log("Logging data:", parsedata);
            displayUserData(parsedata);

        } catch (error) {
            console.error(error);
            statsContainer.innerHTML = '<p>No data found</p>';
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    // Update progress bars and labels
    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    // Display user data on the page
    function displayUserData(parsedata) {
        const totalQuestions = parsedata.data.allQuestionsCount[0].count;
        const totalEasyQuestions = parsedata.data.allQuestionsCount[1].count;
        const totalMediumQuestions = parsedata.data.allQuestionsCount[2].count;
        const totalHardQuestions = parsedata.data.allQuestionsCount[3].count;

        const solvedEasyQuestions = parsedata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumQuestions = parsedata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHardQuestions = parsedata.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedEasyQuestions, totalEasyQuestions, easyLabel, easyProgressCircle);
        updateProgress(solvedMediumQuestions, totalMediumQuestions, mediumLabel, mediumProgressCircle);
        updateProgress(solvedHardQuestions, totalHardQuestions, hardLabel, hardProgressCircle);

        const carddata=[
            { label:"overall submissions",value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[0].submissions

            },
            { label:"overall easy submissions",value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[1].submissions

            },
            { label:"overall medium submissions",value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[2].submissions

            },
            { label:"overall hard submissions",value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[3].submissions

            }
        ];
        console.log("card",carddata);

        
        
    }
    // Event listener for search button
    searchButton.addEventListener("click", function () {
        const username = usernameInput.value;
        console.log("Logging user", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
