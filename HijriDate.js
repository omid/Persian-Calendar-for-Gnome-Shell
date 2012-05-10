/* 
 * Based on a code from http://www.tabibmuda.com/page.php?8
 */ 

let HijriDate = {};

HijriDate.intPart = function (floatNum)
{
    if (floatNum< -0.0000001){
        return Math.ceil(floatNum-0.0000001);
    }
    return Math.floor(floatNum+0.0000001);
}

HijriDate.ToHijri = function (y, m, d)
{
    let jd, l, n, j;
    if ((y>1582)||((y==1582)&&(m>10))||((y==1582)&&(m==10)&&(d>14))) {
        jd=HijriDate.intPart((1461*(y+4800+HijriDate.intPart((m-14)/12)))/4)+HijriDate.intPart((367*(m-2-12*(HijriDate.intPart((m-14)/12))))/12)-HijriDate.intPart( (3* (HijriDate.intPart(  (y+4900+    HijriDate.intPart( (m-14)/12)     )/100)    )   ) /4)+d-32075;
    } else {
        jd = 367*y-HijriDate.intPart((7*(y+5001+HijriDate.intPart((m-9)/7)))/4)+HijriDate.intPart((275*m)/9)+d+1729777;
    }
    l=jd-1948440+10632;
    n=HijriDate.intPart((l-1)/10631);
    l=l-10631*n+354;
    j=(HijriDate.intPart((10985-l)/5316))*(HijriDate.intPart((50*l)/17719))+(HijriDate.intPart(l/5670))*(HijriDate.intPart((43*l)/15238));
    l=l-(HijriDate.intPart((30-j)/15))*(HijriDate.intPart((17719*j)/50))-(HijriDate.intPart(j/16))*(HijriDate.intPart((15238*j)/43))+29;
    m=HijriDate.intPart((24*l)/709);
    d=l-HijriDate.intPart((709*m)/24);
    y=30*n+j-30;

    return [y, m, d];
}

HijriDate.fromHijri = function (y, m, d)
{
    let jd, l, n, j, i;
    jd=HijriDate.intPart((11*y+3)/30)+354*y+30*m-HijriDate.intPart((m-1)/2)+d+1948440-385;
    if (jd> 2299160) {
        l=jd+68569;
        n=HijriDate.intPart((4*l)/146097);
        l=l-HijriDate.intPart((146097*n+3)/4);
        i=HijriDate.intPart((4000*(l+1))/1461001);
        l=l-HijriDate.intPart((1461*i)/4)+31;
        j=HijriDate.intPart((80*l)/2447);
        d=l-HijriDate.intPart((2447*j)/80);
        l=HijriDate.intPart(j/11);
        m=j+2-12*l;
        y=100*(n-49)+i+l;
    } else {
        j=jd+1402;
        k=HijriDate.intPart((j-1)/1461);
        l=j-1461*k;
        n=HijriDate.intPart((l-1)/365)-HijriDate.intPart(l/1461);
        i=l-365*n+30;
        j=HijriDate.intPart((80*i)/2447);
        d=i-HijriDate.intPart((2447*j)/80);
        i=HijriDate.intPart(j/11);
        m=j+2-12*i;
        y=4*k+n+i-4716;
    }
    
    return [y, m, d];
}
