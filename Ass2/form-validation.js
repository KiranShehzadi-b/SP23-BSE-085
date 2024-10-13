function validateForm() {
  
    let name = document.forms["myForm"]["name"].value.trim();
    let email = document.forms["myForm"]["email"].value.trim();
    let address = document.forms["myForm"]["address"].value.trim();
    let city = document.forms["myForm"]["city"].value.trim();

    var validCharacters = /^[a-zA-Z0-9_]*$/;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var cityPattern = /^[a-zA-Z\s]*$/;
    let isValid = true;

   
    if (name.length < 3 || name.length > 20) {
        document.getElementById("nameError").innerHTML = "Username must be between 3 and 20 characters.";
        isValid = false;
    } else if (!validCharacters.test(name)) {
        document.getElementById("nameError").innerHTML = "Username can only contain letters, numbers, and underscores.";
        isValid = false;
    }

   
    if (email.length === 0) {
        document.getElementById("emailError").innerHTML = "Email address cannot be empty.";
        isValid = false;
    } else if (!emailPattern.test(email)) {
        document.getElementById("emailError").innerHTML = "Please enter a valid email address.";
        isValid = false;
    }

  
    if (address.length < 10 || address.length > 100) {
        document.getElementById("addressError").innerHTML = "Address must be between 10 and 100 characters.";
        isValid = false;
    }

    // City validation
    if (city.length === 0) {
        document.getElementById("cityError").innerHTML = "City name cannot be empty.";
        isValid = false;
    } else if (!cityPattern.test(city)) {
        document.getElementById("cityError").innerHTML = "City name must only contain letters and spaces.";
        isValid = false;
    }

    return isValid;
}