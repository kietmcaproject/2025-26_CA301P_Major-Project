var main = document.querySelector("#main")
var cursor = document.querySelector("#cursor")
var imageDiv = document.querySelector("#image")
main.addEventListener("mousemove", function(dets){
    gsap.to(cursor, {
        x:dets.x,
        y:dets.y,
        duration :1       
})
})

main.addEventListener("click", function(){
    gsap.to(cursor, {
        scale: 0.5,
        duration: 0.2,
        yoyo: true,
        repeat: 1
    })
})

image.addEventListener("mouseenter", function(){
    cursor.innerHTML = "View"
    gsap.to(cursor, {
        scale: 1.5,
        backgroundColor: "#0048ffcc"
    })
})
image.addEventListener("mouseleave", function(){
    cursor.innerHTML = ""
    gsap.to(cursor, {
        scale: 1,
        backgroundColor: "red"
    })
})

// can click anywhere in page
// main.addEventListener("click", function(){
//     image.click()
// })



// scroll trigger
gsap.to("#banner h1", {
    transform: "translateX(-500px)",
    scrollTrigger: {
        trigger: "#banner",
        scroller: "body",
        // markers: true,
        start: "top 20%",
        end: "top -10%",
        scrub: 2,
        pin: true,
    }

})

