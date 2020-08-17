function cardpreview(){
    //Step 1: Get data from form.
    let cardname = document.getElementById("cardname").value;
    let carddesc = document.getElementById("carddesc").value;
    let cardimg = document.getElementById("cardimg").value;
    let cardrarity = document.getElementById("cardrarity").value;
    let cardtype = document.getElementById("cardtype").value;
    let cardattr = document.getElementById("cardattr").value;
    if(cardattr != "") cardattr = cardattr.split("\n");
    else cardattr = [];
    
    //Step 2: Generate URL
    let preview = "/create/preview/?";
    preview += "n="+cardname;
    if(carddesc) preview+="&d="+carddesc;
    if(cardimg) preview+="&img="+cardimg;
    preview+="&r="+cardrarity;
    preview+="&t="+cardtype;
    console.log(cardattr);
    if(cardattr != []){
        for(a of cardattr){
            preview+="&a="+a;
        }
    }
    

    //Step 3: Open preview in new tab
    window.open(preview);
}