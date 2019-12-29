import React, { useEffect } from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';
import AnnotationText from './AnnotationText';

function AnnotationElement(props) {
	var _mapHelper = new MapPositionCalculator();
	const x = () =>
		_mapHelper.maturityToX(
			props.position.maturity,
			props.mapDimensions.width
		);
	const y = () =>
		_mapHelper.visibilityToY(
			props.position.visibility,
			props.mapDimensions.height
		);
	const [position, setPosition] = React.useState({
		x: x(),
		y: y(),
		coords: {},
	});

	const handleMouseMove = React.useRef(e => {
		setPosition(position => {
			const xDiff = position.coords.x - e.pageX;
			const yDiff = position.coords.y - e.pageY;
			return {
				x: position.x - xDiff,
				y: position.y - yDiff,
				coords: {
					x: e.pageX,
					y: e.pageY,
				},
			};
		});
	});

	const handleMouseDown = e => {
		const pageX = e.pageX;
		const pageY = e.pageY;

		setPosition(position =>
			Object.assign({}, position, {
				coords: {
					x: pageX,
					y: pageY,
				},
			})
		);
		document.addEventListener('mousemove', handleMouseMove.current);
	};

	const handleMouseUp = () => {
		document.removeEventListener('mousemove', handleMouseMove.current);
		setPosition(position =>
			Object.assign({}, position, {
				coords: {},
			})
		);
		endDrag();
	};

	function endDrag() {
		if(props.mapText.indexOf('annotations ') > -1){
			props.mutateMapText(	
				props.mapText
					.split('\n')
					.map(line => {
						if (
							line
								.replace(/\s/g, '')
								.indexOf(
									'annotations'
								) !== -1
						) {
							return line.replace(
								/\[(.+?)\]/g,
								`[${(1 -
									((1 / props.mapDimensions.height) * position.y)).toFixed(2)}, ${(
									(1 / props.mapDimensions.width) *
									position.x
								).toFixed(2)}]`
							);
						} else {
							return line;
						}
					})
					.join('\n')
			);		
		}
		else {
			props.mutateMapText(props.mapText + '\n' + 'annotations ['+ (1 -
			((1 / props.mapDimensions.height) * position.y)).toFixed(2) + ', '+((1 / props.mapDimensions.width) * position.x).toFixed(2)+']');
		}
	}

	var redraw = function(){
		var elem = document.getElementById('annotationsBoxWrap'); 
		if(elem != undefined) elem.parentNode.removeChild(elem);
		
		var ctx = document.getElementById("annotationsBox"),
		SVGRect = ctx.getBBox();
		var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("x", (SVGRect.x - 2));
		rect.setAttribute('id', 'annotationsBoxWrap');
		rect.setAttribute("y", (SVGRect.y - 2));
		rect.setAttribute('class', 'draggable');
		rect.setAttribute("width", (SVGRect.width + 4));
		rect.setAttribute("height", (SVGRect.height + 4));
		rect.setAttribute("stroke", '#aeaeae');
		rect.setAttribute("fill", "#ececec");
		ctx.insertBefore(rect, document.getElementById('annotationsBoxTextContainer'));
	}

	useEffect(() => {
		position.x = x();
		redraw();
	}, [props.position.maturity]);
	useEffect(() => {
		position.y = y();
		redraw();
	}, [props.position.visibility]);

	useEffect(() => {
		position.y = y();
		position.x = x();
		redraw();
	}, [props.mapDimensions, props.mapStyle]);

	useEffect(()=> {
		redraw();
	}, [props.annotations])

	return (
		<>
		<g
			id={'annotationsBox'} 
			transform={'translate (' + position.x + ',' + position.y + ')'}
			onMouseDown={e => handleMouseDown(e)}
			onMouseUp={e => handleMouseUp(e)}
		>	
			<text id={'annotationsBoxTextContainer'}>
				{props.annotations.map((a, i) => {			
					return <AnnotationText annotation={a} key={i} parentIndex={i} />
				})}
			</text>
		</g>
	</>
	);
}

export default AnnotationElement;
