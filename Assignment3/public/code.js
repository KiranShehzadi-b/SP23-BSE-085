$(document).ready(function () {
    // Function to load description from a text file and display it in a specific div
    function loadDescription(buttonId, descriptionId, file) {
        $(buttonId).on('click', function () {
            $.get(file, function (data) {
                $(descriptionId).html(data).slideDown(); // Populate the description div with data and show it
            });
        });
    }

    // Load description for Project 1
    loadDescription('#semester1-btn', '#semester1-description', 'project1.txt');

    // Load description for Project 2
    loadDescription('#semester2-btn', '#semester2-description', 'project2.txt');
});
