
JavaScript was a marketing ploy to try to position this language as a palatable alternative to writing the heavier and more well-known Java of the day. It could just as easily have been called "WebJava," for that matter.

like using `{}` to block a code and `;` to end a line/statement.

# **Print in JS**

we use `console` to print anything in JavaScript.

# [**Variables & Data Types**](./var.js)
most fundamental unit of information in a program is a value. Values are data. They're how the program maintains state. Values come in two forms in JS: `primitive` and `object`.

Values are embedded in programs using literals:
```js
greeting("My name is Kyle.");
```

you can also delimit a string literal via using a `` ` ``

```js
console.log("My name is ${ firstName }.");
// My name is ${ firstName }.

console.log('My name is ${ firstName }.');
// My name is ${ firstName }.

console.log(`My name is ${ firstName }.`);
// My name is Kyle.
//we are assuming there is somewhere a defined variable firstName
```

reserve backticks only for strings that will include interpolated expressions.

# [**Objects**](./obj.js)
Objects are more general: an unordered, keyed collection of any various values. 
You access the element by a string location name (aka "key" or "property") rather than by its numeric position (as with arrays). 

```js
var me = {
    first: "Kyle",
    last: "Simpson",
    age: 39,
    specialties: [ "JS", "Table Tennis" ]
};

console.log(`My name is ${ me.first }.`);
```

`me` represents an object, and `first` represents the name of a location of information in that object (value collection). Another syntax option that accesses information in an object by its property/key uses the square-brackets `[ ]`, such as `me["first"]`.

# Value Type Determination
For distinguishing values, the typeof operator tells you its built-in type, if primitive, or "object" otherwise:
```js
typeof 42;                  // "number"
typeof "abc";               // "string"
typeof true;                // "boolean"
typeof undefined;           // "undefined"
typeof null;                // "object" -- oops, bug!
typeof { "a": 1 };          // "object"
typeof [1,2,3];             // "object"
typeof function hello(){};  // "function"
```

|WARNING:|
|-|
|`typeof null` unfortunately returns `"object"` instead of the expected `"null"`. Also, typeof returns the specific `"function"` for functions, but not the expected `"array"` for arrays.|

Converting from one value type to another, such as from string to number, is referred to in JS as "coercion." We'll cover this in more detail later in this chapter.


Primitive values and object values behave differently when they're assigned or passed around. We'll cover these details in Appendix A, "Values vs References."


# Variables and DataTypes
Variables are used to store data into something; think of variables as just containers for values.
Variables have to be declared (created) to be used. ex:
```js
var myName = "Kyle";
var age;

let myName = "Kyle";
let age;
```

difference b/w `var` and `let`: `let` allows a more limited access to the variable than `var`

```js
var adult = true;

if (adult) {
    var myName = "Kyle";
    let age = 39;
    console.log("Shhh, this is a secret!");
}

console.log(myName);
// Kyle

console.log(age);
// Error!
```

this happened because `age` was block-scoped to the `if`, whereas `myName` was not.

`const` are values that can't be re-assigned once they are declared.
```js
const myBirthday = true;
let age = 39;

if (myBirthday) {
    age = age + 1;    // OK!
    myBirthday = false;  // Error!
}
```
---

# Function
Function are somethng that take some input and then return back an output
`input=>function=>output`
Function is a collection of statements that can be invoked one or more times, may be provided some inputs, and may give back one or more outputs.

```js
function awesomeFunction(coolThings) {
    // ..
    return amazingStuff;
}
```
functions are values that can be assigned (as shown in this snippet) and passed around.

Functions also can return values using the `return` keyword.

You can only return a single value, but if you have more values to return, you can wrap them up into a single object/array.


# Equality and Comparison
`==` and `===` 
double equals only checks for the values of the operators
triple equals checks for type + reference + coercion

If the value types being compared are different, the `==` differs from `===` in that it allows coercion before the comparison. In other words, they both want to compare values of like types, but `==` allows type conversions first, and once the types have been converted to be the same on both sides, then `==` does the same thing as `===`. Instead of "loose equality," the `==` operator should be described as "coercive equality."

```js
42 == "42";             // true
1 == true;              // true
```

These relational operators typically use numeric comparisons, except in the case where both values being compared are already strings; in this case, they use alphabetical (dictionary-like) comparison of the strings:
```js
var x = "10";
var y = "9";

x < y;      // true, watch out!
```

----

# [Classes](./class.js)
A class in a program is a definition of a "type" of custom data structure that includes both data and behaviors that operate on that data. Classes define how such a data structure works, but classes are not themselves concrete values. To get a concrete value that you can use in the program, a class must be instantiated (with the `new` keyword) one or more times.
```js
class Page {
    constructor(text) {
        this.text = text;   //data
    }

    print() {   //behaviour
        console.log(this.text);
    }
}

mathNotes = new Notebook()  //creates instance of class
```


you can have other features also:

## Inheritance
```js
class Publication {
    constructor(title,author,pubDate) {
        this.title = title;
        this.author = author;
        this.pubDate = pubDate;
    }

    print() {
        console.log(`
            Title: ${ this.title }
            By: ${ this.author }
            ${ this.pubDate }
        `);
    }
}

class Book extends Publication {    //use the extends clause to extend the general definition of Publication to include additional behavior. 
    constructor(bookDetails) {
        super(
            bookDetails.title,
            bookDetails.author,
            bookDetails.pubDate
        );
        this.publisher = bookDetails.publisher;
        this.ISBN = bookDetails.ISBN;
    }

    print() {
        super.print();
        console.log(`
            Publisher: ${ this.publisher }
            ISBN: ${ this.ISBN }
        `);
    }
}

class BlogPost extends Publication {
    constructor(title,author,pubDate,URL) {
        super(title,author,pubDate);
        this.URL = URL;
    }

    print() {
        super.print();
        console.log(this.URL);
    }
}
``
