module.exports = class CreateRuler {

	constructor(marginLeft, marginRight, rulerWidth){

		//window.$(".ruler").append("<p>Hi</p>");
		this.marginLeft = marginLeft;
		this.marginRight = marginRight;
		this.rulerWidth = rulerWidth;
		
		window.$(".ruler").css("margin-left",this.marginLeft);
		window.$(".ruler").css("margin-right",this.marginRight);
		window.$(".ruler").css("width",this.rulerWidth+"cm");

		appendMeasurements(this.rulerWidth);
	}

}

function appendMeasurements(rulerWidth){
	console.log("appendMeasurements");
	var i;
	var htmlString = ""
	var cmAdjustedWidthPercentage = 100.0 / rulerWidth;
	for(i = 0; i < rulerWidth; i++){

		htmlString += "<div class='cm' style='width:"+cmAdjustedWidthPercentage+"%;left:"+cmAdjustedWidthPercentage*i+"%'>";
		var j;
		for(j = 0; j < 10; j++ ){

			htmlString += "<div class='mm'></div>"
		}
		htmlString += i+"</div>";
	}

	window.$(".ruler").append(htmlString);

}

