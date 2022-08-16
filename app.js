const $ =document.querySelector.bind(document)  
const r = $(':root')
const cardDOM = $(".card")
const btnTurnOn = $(".sw_turn")
const bi = $(".bi_turn")
const iconFan = $(".fa-fan")
const listData = $(".list_data")
const btnList = $(".btn_list")
const state_pump = $(".state_pump")
const btnAuto = $(".sw_auto")
const bi_auto = $(".bi_auto")
const title_option = $(".title_option")
const layoutBoxFan =  $(".layout_box_fan")
const chartData = $(".chart_data")

const arrKeyData=[]
var arrData =[]
var arrTime =[]
var strData 
var strTime
var chart

var today = new Date().toLocaleString().substr(10,19)
var todayArg = today.replace("/","-").replace("/","-")
var intervalID;
const timeUpdate =6000;
var currentDay = todayArg;
var isRun =false;
var dataVDK;
var count = 0;
var valueCompareMin = 30;
var valueCompareMax = 50;
var strState;

var isStatePump;
var isAuto = true;
var countShowToast = 0;
var countSaveTimerMin = 0;
var isMin = false;

// setting firebase
settingFirebase()
const showToastPumpON=()=>{
    toast({  
    type:"error",
    title:"Độ ẩm đất thấp",
    message:"Tự động bật máy bơm",
    duration:3000
    });
}
const showToastPumpOFF=()=>{
    toast({  
    type:"check",
    title:"Độ ẩm đất cao",
    message:"Tự động ngắt máy bơm",
    duration:3000
    });
}

const turnOnPump=()=>{
    if(isRun==false){
        btnTurnOn.click();
    }
}
const turnOFFPump=()=>{
    if(isRun==true){
        btnTurnOn.click();
    }
}

const checkToast=(data,valueCompareMin,valueCompareMax)=>{
  if(isAuto==true){
    if(data>=valueCompareMax  && isRun==true){
        showToastPumpOFF();
        turnOFFPump();
    }
    if(data<valueCompareMin  && isRun==false){
        showToastPumpON();
        turnOnPump();
    }
  }
}

// function set % in css
function myFunction_set(humi) {
     r.style.setProperty('--num',humi);
}

//get first config

function getDataInit(){
  const dbRef = firebase.database().ref();
dbRef.child("current").child("isAuto").get().then((snapshot) => {
  if (snapshot.exists()) {
    console.log("isAuto:",snapshot.val());
    isAuto = snapshot.val()
  } else {
    console.log("No data available");
  }
}).catch((error) => {
  console.error(error);
});
  const dbRef2 = firebase.database().ref();
dbRef2.child("current").child("isPump").get().then((snapshot) => {
  if (snapshot.exists()) {
    console.log("isAuto:",snapshot.val());
    isPump = snapshot.val()
  } else {
    console.log("No data available");
  }
}).catch((error) => {
  console.error(error);
});
btnTurnOn.click();
btnAuto.click();

}
// getDataInit()

// get data :
function UpdateData(){
  
  var dbRef = firebase.database().ref().child("current").child("data");
dbRef.on('value', snap => {
  checkToast(snap.val(),valueCompareMin,valueCompareMax);
  chartCircle.updateSeries([snap.val()]);
});

// check connect:

// get first data State wifi
var prevStateWifi=0;
var countWf = 0;
var nowStateWifi;
function checkConnecting(){


var dbRef = firebase.database().ref().child("current").child("stateWifi");
dbRef.on('value', snap => {
  nowStateWifi = snap.val()

});
}
checkConnecting()

setInterval(() =>{
    // checkConnecting()
    console.log("prev2:",prevStateWifi,"||","now2:",nowStateWifi);
    if(prevStateWifi == nowStateWifi){
      countWf++
      console.log("mat ket noi");
      if(countWf > 5){
          document.querySelector(".boxIconConnect").classList.remove("hide")
          document.querySelector(".layout_lostConnect").classList.remove("hide")
          countWf=0;  
        }
      }else{
        document.querySelector(".boxIconConnect").classList.add("hide")
        document.querySelector(".layout_lostConnect").classList.add("hide")
        
    }
    prevStateWifi = nowStateWifi;
    
},1000)


}

//func update state pump:

function UpdateState(){
let isPump;
let currentPump;
var dbRef = firebase.database().ref().child("current").child("isPump");
dbRef.on('value', snap => {
  isPump = snap.val()
checkState(isPump,"");
});
var dbRef2 = firebase.database().ref().child("current").child("currentPump");
dbRef2.on('value', snap => {
  currentPump = snap.val()
checkState(isPump,snap.val());
});

}

//change boolean:
function changeBoolean(boolean){
      return boolean==true ? 1 : 0
}

//func send control to server:
function sendDataInput(statePump){
  firebase.database().ref().child("current").update({
      isPump: changeBoolean(statePump)
  })
}
//func send control isAuto to server:
function sendAutoInput(stateAuto){
  firebase.database().ref().child("current").update({
    isAuto: changeBoolean(stateAuto)
})
}
//-----------
UpdateState();
renderListData();

function firstChar(){

drawChart("myChart",arrData,arrTime,'thời gian',today,today)

}
setInterval(()=>{ firstChar()},60000)

// firebase:
function settingFirebase(){
const firebaseConfig = {
apiKey: "AIzaSyAWTMhUxNrSk_62tYQczg6Gxi80u8Sfi1s",
authDomain: "doan2-6c6e3.firebaseapp.com",
databaseURL: "https://doan2-6c6e3-default-rtdb.firebaseio.com",
projectId: "doan2-6c6e3",
storageBucket: "doan2-6c6e3.appspot.com",
messagingSenderId: "981538583431",
appId: "1:981538583431:web:59a10db252f254cebfd922",
measurementId: "G-SL984LHB9B"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
}

// get data :
function getData(date) { 
return new Promise((resolve, reject) => {
var dbRef = firebase.database().ref().child("dataList").child(date).child("data");
dbRef.on('value', snap => {
resolve(snap.val())
});
})
}

//get time:
function getTime(date){
return  new Promise((resolve, reject) => {
var dbRef = firebase.database().ref().child("dataList").child(date).child('time');  
dbRef.on('value', snap =>{ 
resolve(snap.val())
});
})

}

// get data from firebase:
async function getDataFirebase(date){
strData = await getData(date)
strTime = await getTime(date)
handleDataFirebase(strData,strTime); // convert string to array
// console.log(arrData, arrTime);
}
getDataFirebase(todayArg)



// fun handle data :
function handleDataFirebase(strData,strTime) {
arrData=strData.split(",")
arrData.pop()
arrTime=strTime.split(",")
arrTime.pop()
}

//----------

// update time current:
setInterval(function(){ document.querySelector(".title_timer").innerHTML =(new Date().toLocaleString())},1000)

// render list data localStorage
function renderListData(){
var strList = "";

// get name list data once:
  const dbRef = firebase.database().ref().child("dataList");
  dbRef.get().then((snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        if(childSnapshot.key!=""){
          arrKeyData.push(childSnapshot.key)
        }
      })
      arrKeyData.forEach((day) => {
        strList+=`<li class="item-day">${day}</li>`
      })
      listData.innerHTML = strList
      clickListDay();
      return arrKeyData
    } else {
      console.log("get list data fail");
    }
  }).catch((error) => {
    console.error(error);
  });
  
}



// draw chart first
setTimeout(()=>{ firstChar()},1005)

// Show on pump:
function showOffPump(statePump){
bi.classList.add("slideBi") 
btnTurnOn.style.backgroundColor=``
  if(statePump == '0'){
    iconFan.classList.remove("fa-spin")
    state_pump.innerHTML = "OFF"
    state_pump.style.backgroundColor ='rgba(220, 220, 220, 0.7)'
  }
}

// Show off pump:
function showOnPump(statePump){
bi.classList.remove("slideBi")
btnTurnOn.style.backgroundColor=`#74ace2`
if(statePump == '1'){
  iconFan.classList.add("fa-spin")
  state_pump.innerHTML = "ON"
  state_pump.style.backgroundColor ='#ce1b1b'
}
}
// function check state pump:
function checkState(state, statePump){
  if(state == 1){
      showOnPump(statePump);
  } 
  if(state == 0){
     showOffPump(statePump);
  }   
}


// click btn pump:
btnTurnOn.onclick=function(){
        isRun=!isRun;
    sendDataInput(isRun);
    console.log(isRun);
        if (isRun==false && isAuto==false){
            bi.classList.add("slideBi") 
            btnTurnOn.style.backgroundColor=``         
        }
        if (isRun==true && isAuto==false){
            bi.classList.remove("slideBi")
            btnTurnOn.style.backgroundColor=`#74ace2` 
        }
    }

// btn auto:
    btnAuto.onclick=function(){
        isAuto=!isAuto;
        sendAutoInput(isAuto);
        console.log(isAuto);
        if (isAuto==true){
            bi_auto.classList.toggle("slideBi") 
            btnAuto.classList.add("color_bi_auto") 
            title_option.innerHTML = "Tự động"
            layoutBoxFan.style.display="block"
          }
          if (isAuto==false){
            bi_auto.classList.toggle("slideBi")
            btnAuto.classList.remove("color_bi_auto")      
            title_option.innerHTML = "Thủ công"
            layoutBoxFan.style.display="none"
            
        }

    }
// click layout box fan:
    layoutBoxFan.onmouseup=()=>{
        title_option.classList.add("animate__shakeX")
    }
    layoutBoxFan.onmousedown=()=>{
        title_option.classList.remove("animate__shakeX")
        countShowToast++
        if(countShowToast==6 || countShowToast==1){
          countShowToast=2;
          toast({  
          type:"warning",
          title:"Đang ở chế độ tự động!",
          message:"Tắt chế tự động để điều khiển",
          duration:3000
          });
        }
    }


// btn list 
btnList.onclick=(e)=>{
  console.log(e.target.className);
    if(e.target.className=="btn_list" || e.target.className=="title_list" || e.target.className=="fa-solid fa-list"){
        listData.classList.toggle("hideList")
    }
}

// khoi tao chart ban dau:
// setInterval(()=>{
//     var awaitData = new Promise((resolve,reject)=>{
//       resolve(getDataCurrentDay(currentDay))           
//   })
//   .then((data)=>{
//     console.log("data:",arrTime);
//     arrData = data[0]
//     arrTime = data[1]
//     if(arrData.length>12){
//       arrData=arrData.slice(arrData.length-12, arrData.length)
//       arrTime=arrTime.slice(arrTime.length-12, arrTime.length)
//     }
//     console.log("arrData sau up : ",arrData);
//     var data = arrData
//     chart.updateSeries([{data}])
//   })
// },timeUpdate)


// handle data chart:

const getDataCurrentDay = async (currentDay)=>{
 strData = await getData(currentDay)
 strTime = await getTime(currentDay)
 handleDataFirebase(strData,strTime);
 return [arrData,arrTime]
}

function getDataAndDraw(currentDay, checkClick, e, day){
  var awaitData = new Promise((resolve,reject)=>{
      resolve(getDataCurrentDay(currentDay))           
  })
  .then((data)=>{
    arrData = data[0]
    arrTime = data[1]
    checkClick(e, day)
  })

}

// update data for chart current day:
setInterval(()=>{ 
  var awaitData = new Promise((resolve,reject)=>{
    resolve(getDataCurrentDay(currentDay))           
})
.then((data)=>{
  arrData = data[0]
  arrTime = data[1]
})
},20000)


//click list day:
function clickListDay(){

const listDay = document.querySelectorAll(".item-day")
listDay.forEach((day,index)=>{
day.onclick=(e)=>{
  currentDay = day.textContent
  getDataAndDraw(currentDay, checkClick, e, day)

  }
})


}
// handle draw chart when click list day
function checkClick(e, day){
    if(e.target.className=="item-day" || e.target.className=="list_data"){
        if(day.textContent==currentDay){
            document.querySelector("#myChart").innerHTML=""
           drawChart("myChart",arrData,arrTime,'thời gian', currentDay, todayArg);
            document.querySelector(".box_chart").classList.remove("hide")
            // update 
            // document.querySelector(".title_chart").innerHTML=day.textContent

        }else{
           console.log("ko =");
            document.querySelector("#myChart").innerHTML=""
            drawChart("myChart",arrData,arrTime,'thời gian', currentDay,todayArg);
            //
            // document.querySelector(".title_chart").innerHTML=day.textContent
            document.querySelector(".box_chart").classList.remove("hide")

        }

  }
      }

 

// chart:
function drawChart(idChart,data,time,xaxisCurrent, currentDay, clickDay){
var dataFB =[]
function handleData(arrData, arrTime){
     arrData.forEach((item,index)=>{
           dataFB.push([parseInt(arrTime[index])*1000,parseInt(item)])
     })
     return dataFB 
}
console.log(handleData(data,time));



Highcharts.stockChart(idChart, {
chart: {
  events: {
    load: function () {
      console.log(clickDay == currentDay);
      if(clickDay==currentDay){
        // set up the updating of the chart each second
        var series =this.series[0];
         intervalID = setInterval(function () {
          console.log("ve lai");
            dataFB.push([parseInt(arrTime[arrTime.length-1])*1000,parseInt(arrData[arrData.length-1])])
             var x = parseInt(dataFB[dataFB.length-1][0]+20000), // current time
             y = parseInt(dataFB[dataFB.length-1][1]);
            series.addPoint([x, y], true, true);
  
        }, 20000);

      }else{
        clearInterval(intervalID)
      }

    }
  },
  
},
rangeSelector: {
  selected: 1
},

time: {
  useUTC: false,
},

rangeSelector: {
  buttons: [{
    count: 1,
    type: 'minute',
    text: '1M'
  }, {
    count: 5,
    type: 'minute',
    text: '5M'
  }, {
    type: 'all',
    text: 'All'
  }],
  selected: 1,
  inputEnabled: false
},

title: {
  text: `Đồ thị độ ẩm đất ngày ${currentDay}`
},
xAxis: {
  type: 'datetime',
  title: {
      text: `Thời gian (s)`
  }
},
yAxis: {
  title: {
      text: `Độ ẩm đất (%)`
  },
  min: 0
},


series: [{
  name: 'độ ẩm đất',
  type: 'areaspline',
  data: dataFB,
  gapSize: 5,
  tooltip: {
    valueDecimals: 2
  },
  fillColor: {
    linearGradient: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1
    },
    stops: [
      [0, Highcharts.getOptions().colors[0]],
      [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
    ]
  },
  
}]
});

document.querySelector(".highcharts-credits").style.display ="none";
}

// ------------options chart Circle------------
var optionsCircle = {
  series: [25],
  labels: ["Độ ẩm đất"],
  chart: {
  height: 380,
  type: 'radialBar',
},
plotOptions: {
  radialBar: {
    hollow: {
      margin: 15,
      size: '70%',
      imageWidth: 64,
      imageHeight: 64,
      imageClipped: false
    },
    dataLabels: {
      name: {
        show: true,
        color: '#888888'
      },
      value: {
        show: true,
        color: '#333',
        offsetY: 20,
        fontSize: '22px'
      }
    }
  }
},
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "horizontal",
      shadeIntensity: 0.5,
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100]
    }
  },
stroke: {
  lineCap: 'round',
},


};
var chartCircle = new ApexCharts(
  document.querySelector("#circlechart"),
  optionsCircle
);
chartCircle.render();






// Toast ::

function toast({type='success',title='',message='',duration=1000}){
const mainToast =$("#toast")

const icons={
    success:"<i class='bx bxs-smile' ></i>",
    check:'<i class="fa-solid fa-droplet-slash"></i>',
    error:'<i class="fa-solid fa-droplet"></i>',
    warning:"<i class='bx bxs-error' ></i>"
}
if (mainToast){
    const toast = document.createElement('div')
    // auto remove toast:
    const autoRemoveId= setTimeout(function(){
        mainToast.removeChild(toast);
    },duration+1000);
    //remove toast when clicked:
    toast.onclick=function(e){
        if (e.target.closest(".toast__close")){
            mainToast.removeChild(toast);
            clearTimeout(autoRemoveId);
        }
    }
    const icon=icons[type]
    const delay=  duration / 1000
    toast.classList.add('toast',`toast__${type}`)
    toast.style.animation = `slideToLeft ease 0.5s, fade linear 1s ${delay}s forwards`
    toast.innerHTML = `           
        <div class="toast__icon">
            ${icon}
        </div>
        <div class="toast__body">
            <h3 class="toast__title">${title}</h3>
            <p class="toast__messege">${message}</p>
        </div>
        <div class="toast__close">
            <i class='bx bx-x'></i>
        </div>
        `;
        mainToast.appendChild(toast);

}
}