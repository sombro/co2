var r = 5 , // radius of dots on graph (px)
	timestep = 10 , // time step (min)
	reload = 60 , // time to reload in (sec), if 0 -> no reload
	co2Min = 0 , // the least amount of co2 on graph (ppm)
	N = 20 , // number of cells by X (number of dots you want see)
	cellWidth = 50 , // width of cell (px = ppm)	
	cellHeight = 50; // height of cell (px = ppm)

function initPath(){
	var date = new Date(),
		year = date.getFullYear(),
		month = date.getMonth() + 1,
		day = date.getDay() + 2,
		path = ''; // path to file with CSV

	if ( month*1 < 10){
		month = "0" + month;
	}
	if ( day*1 < 10){
		day = "0" + day;
	}
	path = "ZG/" + year + "/" + month + "/" + day + ".CSV";

	return path;
};


var file = initPath(), 
	csvString = readTextFile(file),
	csvArray = $.csv.toArrays(csvString),
	length = Object.keys(csvArray).length,
	timestep = timestep * 20,
	M = 10; // number of cells by Y

if (length < N * timestep){
	N = Math.floor( length / timestep );
}

graphCO2(N, autoField(N));

function autoField(N){
	var co2 = 0,
		co2Max = 0;
	co2Min = 2000;	
	for (var i = 0; i < N + 1; i++ ){
		co2 = csvArray[length - (N - i ) * timestep - 1][1];
		if (co2*1 < co2Min*1){
			co2Min = co2;
		};
		if (co2*1 > co2Max*1){
			co2Max = co2;
		};
	}
	M = Math.ceil( (co2Max - co2Min) / cellHeight ) + 4;
	$("#co2Max").html(co2Max);
	$("#co2Min").html(co2Min);
	co2Min = (Math.floor(co2Min / cellHeight) - 2) * cellHeight;	

	return M;
};

function graphCO2(N, M){		
	$("#graph").css('width', (N + 2) * cellWidth + "px").css('height', (M + 2) * cellHeight + "px");
	initializeGrid(N, M);
	drawGraph();
	if (reload != 0){
		setTimeout(
        	function() {
            	location.reload();
        	}, reload * 1000
    	);
	}		
};

function initializeYGrid(N, M){
	var yGrid = '',
		yLabels = '',
		grid = 0,
		x1 = 0,
		x2 = 0,
		y1 = 0,
		y2 = M * cellHeight + 10,
		y = M * cellHeight + 35;

	for (var i = 0; i < N + 1; i++){
		x1 = (i + 1) * cellWidth;
		x2 = x1;
		grid = csvArray[length - (N - i) * timestep - 1][0];
		grid = grid.substring(0,5);
		yGrid = yGrid + "<line x1='" + x1 +"' x2='" + x2 +"' y1='" + y1 +"' y2='" + y2 +"'></line>";
		yLabels = yLabels + "<text x='" + (x1 + 10) +"' y='" + y + "'>" + grid + "</text>";
	}
	$('#yGrid').html(yGrid);
	$('#yLabels').html(yLabels);
};	

function initializeXGrid(N, M){
	var xGrid = '',
		xLabels = '',
		grid = 0,
		x1 = cellWidth,
		x2 = (N + 1) * cellWidth + 10,
		y1 = 10,
		y2 = N * cellHeight + 10,
		x = 30;

	for (var i = 0; i < M + 1; i++){
		y1 = i * cellHeight + 10;
		y2 = y1;
		grid = (M - i) * cellHeight + co2Min;
		xGrid = xGrid + "<line x1='" + x1 +"' x2='" + x2 +"' y1='" + y1 +"' y2='" + y2 +"'></line>";
		xLabels = xLabels + "<text x='" + x +"' y='" + (y1+5) + "'>" + grid + "</text>";
	}
	var line800 = M * cellHeight + co2Min - 800 + 10;
	xGrid = xGrid + "<line class='line800' x1='" + x1 +"' x2='" + x2 +"' y1='" + line800 +"' y2='" + line800 +"'></line>";
	var line800 = M * cellHeight + co2Min - 1200 + 10;
	xGrid = xGrid + "<line class='line1200' x1='" + x1 +"' x2='" + x2 +"' y1='" + line800 +"' y2='" + line800 +"'></line>";
	$('#xGrid').html(xGrid);
	$('#xLabels').html(xLabels);
};

function initializeGrid(N, M){
	initializeYGrid(N, M);
	initializeXGrid(N, M);
};

function drawGraph(){
	var co2 = 0,
		circle = '',
		x = 0,
		y = 0,
		temp = '',
		zeroY = M * cellHeight + 10,
		zeroX = (N + 1) * cellWidth;
		coordinates = "M" + cellWidth + "," + zeroY;		
	for (var i = 0; i < N + 1; i++ ){
		x = (i + 1) * cellWidth;
		co2 = csvArray[length - (N - i ) * timestep - 1][1];
		temp = csvArray[length - (N - i ) * timestep - 1][2];
		y = M * cellHeight - co2 + co2Min + 10;
		coordinates = coordinates + " L" + x + "," + y;
		circle = circle + "<circle cx='" + x + "' cy='" + y + "' r='" + r + "' data-co2='" + co2 + "'></circle>";
		// console.log(i+') '+'x= '+x+' ; '+'y= '+y+' ; '+co2+';'+ temp);	
	}
	coordinates = coordinates + " L" + zeroX + "," + zeroY + " Z";
	var path = "<path class='first_set' id='path' d='" + coordinates + "'></path>";
	$("#co2").html(co2);
	$("#temp").html(temp.substring(0,4));
	$('#circles').html(circle);
	$('#surfaces').html(path); 
};

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest(),
    	alltext = '';
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4){
            if(rawFile.status === 200 || rawFile.status == 0){
                allText = rawFile.responseText;                
            }
        }
    }
    rawFile.send(null);
    return allText;
};

$("#circles circle").on('mouseenter', function(){
	$('#hint').html($(this).data('co2')).attr('x', $(this).attr('cx')*1 + 5).attr('y', $(this).attr('cy')*1 - 5);
});
$("#circles circle").on('mouseleave', function(){
	$('#hint').html($(this).data('')).attr('x', 0).attr('y', 0);
});

