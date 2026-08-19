// ==========================================
// 1. CAROUSEL SLIDER ENGINE
// ==========================================
var slideIndex = 0;
var totalSlides = 5;

function updateSlide() {
    var track = document.getElementById('track');
    var dots = document.getElementsByClassName('dot');
    var slideWidth = document.getElementsByClassName('slide-item')[0].clientWidth;
    
    track.style.transform = "translateX(-" + (slideIndex * slideWidth) + "px)";
    
    for (var i = 0; i < dots.length; i++) {
        if (i === slideIndex) {
            dots[i].className = "dot active";
        } else {
            dots[i].className = "dot";
        }
    }
}

function moveSlide(n) {
    slideIndex = slideIndex + n;
    if (slideIndex < 0) { slideIndex = totalSlides - 1; }
    if (slideIndex >= totalSlides) { slideIndex = 0; }
    updateSlide();
}

function currentSlide(n) {
    slideIndex = n;
    updateSlide();
}

window.onresize = function() {
    updateSlide();
};


// ==========================================
// 2. BROKERAGE & PNL CALCULATOR
// ==========================================
function toggleView() {
    var seg = document.getElementById('seg').value;
    var wrapper = document.getElementById('foIndexWrapper');
    var qtyShow = document.getElementById('actualQtyShow');
    
    if (seg === "options") {
        wrapper.style.display = "block";
        qtyShow.style.display = "block";
    } else {
        wrapper.style.display = "none";
        qtyShow.style.display = "none";
    }
    calcPnL();
}

function calcPnL() {
    var broker = document.getElementById('broker').value;
    var seg = document.getElementById('seg').value;
    var buyPrice = parseFloat(document.getElementById('buy').value) || 0;
    var sellPrice = parseFloat(document.getElementById('sell').value) || 0;
    var qtyInput = parseFloat(document.getElementById('qtyPnL').value) || 0;

    if (buyPrice === 0 || sellPrice === 0 || qtyInput === 0) {
        document.getElementById('gross').innerText = "₹0.00";
        document.getElementById('tax').innerText = "₹0.00";
        document.getElementById('res').innerText = "₹0.00";
        document.getElementById('res').className = "";
        return;
    }

    var finalQty = qtyInput;
    if (seg === "options") {
        var idx = document.getElementById('foIndex').value;
        var lotSize = (idx === "nifty") ? 65 : 30;
        finalQty = qtyInput * lotSize;
        document.getElementById('showQ').innerText = finalQty + " Shares";
    }

    var grossPnL = (sellPrice - buyPrice) * finalQty;
    var turnover = (buyPrice + sellPrice) * finalQty;
    var brokerage = 0;
    var tax = 0;

    if (seg === "options") {
        brokerage = 40;
        tax = turnover * 0.0006;
    } else if (seg === "delivery") {
        brokerage = 0;
        tax = turnover * 0.0012;
    } else {
        var b1 = buyPrice * finalQty * 0.0003;
        var b2 = sellPrice * finalQty * 0.0003;
        if (b1 > 20) b1 = 20;
        if (b2 > 20) b2 = 20;
        brokerage = b1 + b2;
        tax = turnover * 0.0006;
    }

    if (broker === "angel") {
        tax = tax + 2; 
    }

    var totalCharges = brokerage + tax;
    var netPnL = grossPnL - totalCharges;

    document.getElementById('gross').innerText = "₹" + grossPnL.toFixed(2);
    document.getElementById('tax').innerText = "₹" + totalCharges.toFixed(2);
    
    var resElement = document.getElementById('res');
    resElement.innerText = "₹" + netPnL.toFixed(2);
    
    if (netPnL >= 0) {
        resElement.className = "profit";
    } else {
        resElement.className = "loss";
    }
}

function clearPnL() {
    document.getElementById('buy').value = "";
    document.getElementById('sell').value = "";
    document.getElementById('qtyPnL').value = "";
    calcPnL();
}


// ==========================================
// 3. RISK MARGIN CALCULATOR
// ==========================================
function calcMargin() {
    var totalRisk = parseFloat(document.getElementById('cap').value) || 0;
    var tradeBox = document.getElementById('numTrades');
    var trades = parseInt(tradeBox.value) || 1;

    if (tradeBox.value !== "") {
        if (trades > 3) { trades = 3; tradeBox.value = 3; }
        if (trades < 1) { trades = 1; tradeBox.value = 1; }
    }

    var leverage = parseInt(document.getElementById('lev').value) || 1;
    var stockPrice = parseFloat(document.getElementById('price').value) || 0;
    var rrRatio = parseInt(document.getElementById('rr').value) || 2;

    if (totalRisk === 0 || stockPrice === 0) { return; }

    var singleTradeCapital = totalRisk / trades;
    var buyingPower = singleTradeCapital * leverage;
    
    var riskPercentage = 1; 
    var riskPerShare = stockPrice * (riskPercentage / 100); 
    
    var shareQty = Math.floor(buyingPower / stockPrice);
    if (shareQty === 0) { shareQty = 1; } 

    var totalLossInTrade = shareQty * riskPerShare;
    var stopLoss = stockPrice - riskPerShare;
    var target = stockPrice + (riskPerShare * rrRatio);

    document.getElementById('power').innerText = "₹" + (totalRisk * leverage).toFixed(2);
    document.getElementById('qtyMargin').innerText = shareQty;
    document.getElementById('loss').innerText = "₹" + totalLossInTrade.toFixed(2);
    document.getElementById('sl').innerText = "₹" + stopLoss.toFixed(2);
    document.getElementById('target').innerText = "₹" + target.toFixed(2);
}

function clearMargin() {
    document.getElementById('cap').value = "";
    document.getElementById('numTrades').value = "";
    document.getElementById('price').value = "";
    document.getElementById('power').innerText = "₹0.00";
    document.getElementById('qtyMargin').innerText = "0";
    document.getElementById('loss').innerText = "₹0.00";
    document.getElementById('sl').innerText = "₹0.00";
    document.getElementById('target').innerText = "₹0.00";
}


// ==========================================
// 4. LIVE OPTION DELTA CALCULATOR
// ==========================================
function calcOptions() {
    var cPrice = parseFloat(document.getElementById('cPrice').value) || 0;
    var cDelta = parseFloat(document.getElementById('cDelta').value) || 0;
    var cMove = parseFloat(document.getElementById('cMove').value) || 0;
    
    if (cPrice > 0) {
        var cTotal = cPrice + (cDelta * cMove);
        if (cTotal < 0) cTotal = 0;
        document.getElementById('cRes').innerText = "₹" + cTotal.toFixed(2);
    } else {
        document.getElementById('cRes').innerText = "₹0.00";
    }

    var pPrice = parseFloat(document.getElementById('pPrice').value) || 0;
    var pDelta = parseFloat(document.getElementById('pDelta').value) || 0;
    var pMove = parseFloat(document.getElementById('pMove').value) || 0;
    
    if (pPrice > 0) {
        var pTotal = pPrice + (pDelta * pMove);
        if (pTotal < 0) pTotal = 0;
        document.getElementById('pRes').innerText = "₹" + pTotal.toFixed(2);
    } else {
        document.getElementById('pRes').innerText = "₹0.00";
    }
}

function clearOptions() {
    document.getElementById('cPrice').value = "";
    document.getElementById('cDelta').value = "";
    document.getElementById('cMove').value = "";
    document.getElementById('pPrice').value = "";
    document.getElementById('pDelta').value = "";
    document.getElementById('pMove').value = "";
    calcOptions();
}


// ==========================================
// 5. QUICK CALCULATOR ENGINE
// ==========================================
var currentExpression = "";

function pressKey(key) {
    var display = document.getElementById('calcDisplay');
    
    if (key === 'C') {
        currentExpression = "";
        display.value = "0";
    } 
    else if (key === '=') {
        try {
            if (currentExpression !== "") {
                var formatted = currentExpression;
                while(formatted.indexOf('%') !== -1) {
                    formatted = formatted.replace('%', '/100');
                }
                currentExpression = eval(formatted).toString();
                display.value = currentExpression;
            }
        } catch(err) {
            display.value = "Error";
            currentExpression = "";
        }
    } 
    else {
        if (display.value === "0" && !isNaN(key)) {
            currentExpression = key;
        } else {
            currentExpression = currentExpression + key;
        }
        display.value = currentExpression;
    }
}


// ==========================================
// 6. TARGET PREMIUM & P&L CALCULATOR (New Module)
// ==========================================
function applyPresetType() {
    var selectVal = document.getElementById('optionSelect').value;
    if (selectVal !== "custom") {
        document.getElementById('deltaVal').value = parseFloat(selectVal).toFixed(2);
    }
    calcTargetCalc();
}

function calcTargetCalc() {
    var buyPrem = parseFloat(document.getElementById('buyPrem').value) || 0;
    var movePts = parseFloat(document.getElementById('spotMove').value) || 0;
    var delta = parseFloat(document.getElementById('deltaVal').value) || 0;
    var qty = parseFloat(document.getElementById('lotQty').value) || 0;

    var changePts = movePts * delta;
    var newPrice = buyPrem > 0 ? (buyPrem + changePts) : changePts;
    if (newPrice < 0) newPrice = 0;
    
    var totalPnL = changePts * qty;

    document.getElementById('changePts').innerText = (changePts >= 0 ? "+" : "") + changePts.toFixed(2) + " pts";
    document.getElementById('newTargetPrice').innerText = "₹" + newPrice.toFixed(2);
    document.getElementById('finalPnL').innerText = "₹" + totalPnL.toFixed(2);
}

function clearTargetCalc() {
    document.getElementById('buyPrem').value = "";
    document.getElementById('spotMove').value = "";
    document.getElementById('optionSelect').value = "0.70";
    document.getElementById('deltaVal').value = "0.70";
    document.getElementById('lotQty').value = "";
    document.getElementById('changePts').innerText = "+0.00 pts";
    document.getElementById('newTargetPrice').innerText = "₹0.00";
    document.getElementById('finalPnL').innerText = "₹0.00";
}
