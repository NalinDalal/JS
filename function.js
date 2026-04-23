let screen = document.getElementById("display");

try {
    screen.innerHTML = myFunction();;

}
catch (err) {
    screen.innerHTML = err.message;
}
// // Arrow function
// //Cannot access 'myFunction' before initialization
var myFunction = () => { // let and const can be used not var
    console.log("name");
    return "this is me";
}
// // works
// --------------------------------------------------------------
// // Function Declaration
// // works
// function myFunction(){
//   return "This is me"
// }
// // works
// --------------------------------------------------------------
// Function expression
let screen1 = document.getElementById("display1");
try {
    screen1.innerHTML = myFunction();;

}
catch (err) {
    screen1.innerHTML = err.message;
}



const value = Sum(40, 45)
console.log(value)
function Sum(a, b) {
    //do things with input and return an output
    return a + b;
}
console.log(Sum)

const value1 = Sum(34, 35)
console.log(value1);
