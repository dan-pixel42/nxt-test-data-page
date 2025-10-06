import React, { useState, useEffect, useRef } from 'react'
import { render, FramerMotion, useCasparData, useImage } from '@nxtedition/graphics-kit'
import { motion, AnimatePresence } from 'framer-motion'

const defaultConfig = {

	header: {
		headerHeight: 110,
		subheaderHeight: 40,
	},

	panel: {
		panelWidth: 50,		// Width glass panel
		panelPadding: 2,	// Padding between cells and glass panel edge
		headerPanelGap: 80,	// Distance between bottom of header and top of glass panel
		screenMargin: 10,	// Safe area margin
	},

	rows: {
		dataRowHeight: 80,				// Default for values row (rows that have towns, temps, wind speed values etc.)
		dataRowSpacing: 20,				// Gap between rows
		dataTitleRowPaddingTop: 60,		// Treating title rows differently (that identify sections). Top padding only used when not top row
		dataTitleRowPaddingBottom: 20,	// Bottom padding only used when not last row.
	},

	fonts: {
		labelFontSize: '2.2rem',
		valueFontSize: '2.2rem',
		prefixSuffixFontSize: '1.4rem',
		titleRowFontSize: '1.8rem',
		titleRowValueFontSize: '1.8rem',
	},

	styling: {
		cellBorderRadius: 14,
		backgroundImage: 'https://www.visitmelbourne.com/-/media/images/international/uk/great-ocean-road-trip/uk_great_ocean_road_drive_1150x863.jpg',
	},

	animation: {

		// Default animation
		entranceAnimation: {
			direction: 'left',
			startFrom: 'top-to-bottom'
		},
		exitAnimation: {
			direction: 'right',
			startFrom: 'bottom-to-top'
		}
	}
}

const colorDefinitions = {

	// Some different cell colour options for this test. 
	// Considering a plan to move to a cell/group/row theme preset in final template. 
	// e.g. min_temp will set blue bg, white text, font-size x, suffix to be °C

	blue: 'linear-gradient(180deg, rgba(60, 133, 255, 0.9), rgba(0, 99, 179, 0.95))',
	orange: 'linear-gradient(180deg, rgba(232, 148, 0, 0.9), rgba(254, 65, 2, 0.95))',
	white: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.95))',
	white50: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(240, 240, 240, 0.5))',
	white30: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(240, 240, 240, 0.3))',
	darkblue: 'linear-gradient(180deg, rgba(0, 34, 102, 0.95), rgba(0, 17, 51, 0.95))',
	red: 'linear-gradient(180deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95))',
	green: 'linear-gradient(180deg, rgba(34, 197, 94, 0.95), rgba(21, 128, 61, 0.95))',
	yellow: 'linear-gradient(180deg, rgba(250, 204, 21, 0.95), rgba(217, 119, 6, 0.95))',
	black: 'linear-gradient(180deg, rgba(23, 23, 23, 0.95), rgba(0, 0, 0, 0.95))',
	clear: 'transparent',

	// Testing a look for sport teams with team logo image overlay

	'nrl-broncos': 'linear-gradient(180deg, rgba(124, 41, 79, 0.95), rgba(92, 20, 49, 0.95))',
	'nrl-raiders': 'linear-gradient(180deg, rgba(74, 189, 65, 0.95), rgba(44, 141, 35, 0.95))',
	'nrl-bulldogs': 'linear-gradient(180deg, rgba(30, 90, 159, 0.95), rgba(0, 60, 119, 0.95))',
	'nrl-sharks': 'linear-gradient(180deg, rgba(51, 146, 194, 0.95), rgba(21, 106, 154, 0.95))',
	'nrl-dolphins': 'linear-gradient(180deg, rgba(234, 48, 56, 0.95), rgba(194, 8, 16, 0.95))',
	'nrl-titans': 'linear-gradient(180deg, rgba(34, 145, 192, 0.95), rgba(2, 105, 152, 0.95))',
	'nrl-seaeagles': 'linear-gradient(180deg, rgba(124, 41, 79, 0.95), rgba(92, 20, 49, 0.95))',
	'nrl-storm': 'linear-gradient(180deg, rgba(109, 63, 160, 0.95), rgba(69, 33, 120, 0.95))',
	'nrl-knights': 'linear-gradient(180deg, rgba(30, 79, 135, 0.95), rgba(0, 49, 95, 0.95))',
	'nrl-cowboys': 'linear-gradient(180deg, rgba(32, 55, 84, 0.95), rgba(6, 25, 50, 0.95))',
	'nrl-eels': 'linear-gradient(180deg, rgba(30, 65, 134, 0.95), rgba(0, 35, 94, 0.95))',
	'nrl-panthers': 'linear-gradient(180deg, rgba(64, 67, 68, 0.95), rgba(34, 37, 38, 0.95))',
	'nrl-rabbitohs': 'linear-gradient(180deg, rgba(30, 79, 45, 0.95), rgba(0, 49, 15, 0.95))',
	'nrl-dragons': 'linear-gradient(180deg, rgba(215, 55, 64, 0.95), rgba(175, 15, 24, 0.95))',
	'nrl-roosters': 'linear-gradient(180deg, rgba(31, 65, 111, 0.95), rgba(1, 35, 71, 0.95))',
	'nrl-warriors': 'linear-gradient(180deg, rgba(41, 51, 129, 0.95), rgba(11, 21, 89, 0.95))',
	'nrl-tigers': 'linear-gradient(180deg, rgba(58, 58, 58, 0.95), rgba(28, 28, 28, 0.95))'
}

// Creates animation variants for Framer Motion entrance and exit animations
const createAnimationVariants = (direction, animationPhase = 'entrance') => {

	// Validate animationPhase is 'entrance' or 'exit'
	if (animationPhase !== 'entrance' && animationPhase !== 'exit') {
		throw new Error(`Invalid animationPhase: "${animationPhase}". Must be 'entrance' or 'exit'.`)
	}

	const animationDistance = 250 // Distance in pixel for basic slide in/out

	// Calculate the start position based on animation direction
	const getAnimationDirectionOffset = () => {
		switch (direction) {
			case 'left': return { x: -animationDistance, y: 0 }
			case 'right': return { x: animationDistance, y: 0 }
			case 'top': return { x: 0, y: -animationDistance }
			case 'bottom': return { x: 0, y: animationDistance }
			default: return { x: -animationDistance, y: 0 }  // Default to left
		}
	}

	const offsetPosition = getAnimationDirectionOffset()  	// Animation starting position
	const centerPosition = { x: 0, y: 0 }        			// Animation rest position
	const isEntrancePhase = animationPhase === 'entrance'

	return {
		// Starting state: off-screen for entrance, center for exit
		initial: {
			opacity: 0,
			...(isEntrancePhase ? offsetPosition : centerPosition)
		},
		// Animate to rest position
		animate: {
			opacity: 1,
			...centerPosition,
			transition: { duration: 0.4, ease: [0, 0, 0.35, 1] }
		},
		// Exit to off-screen position, fading out as well
		exit: {
			opacity: 0,
			...offsetPosition,
			transition: { duration: 0.3, ease: [0.65, 0, 1, 1] }
		}
	}
}

// Set colour of text based on bg colour
const getTextColor = (color) => {

	if (['white', 'yellow', 'white50', 'white30'].includes(color)) return '#1f2937'
	if (color === 'clear') return 'white'

	// default is white
	return 'white'
}

const colorMix = (color, opacity) => {
	const colorMap = {
		white: [255, 255, 255],
		black: [0, 0, 0],
		glass: [187, 187, 188]
	}
	const rgb = colorMap[color]
	return rgb ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})` : color
}

// Apply border radius to cell corners when there is a gap, or it is the corners on the edge
const getCellBorderRadius = (index, totalCells, cells, config) => {
	const radius = config.styling.cellBorderRadius

	if (totalCells === 1) return `${radius}px`

	const prevCellClear = index > 0 && cells[index - 1].color === 'clear'
	const currentCellClear = cells[index].color === 'clear'
	const nextCellClear = index < totalCells - 1 && cells[index + 1]?.color === 'clear'

	if (currentCellClear) return '0'	// If current cell has clear background, no border radius needed

	const gapBefore = (index > 0 && cells[index - 1].gap > 0) || prevCellClear
	const gapAfter = (index < totalCells - 1 && cells[index].gap > 0) || nextCellClear

	if (index === 0) return gapAfter ? `${radius}px` : `${radius}px 0 0 ${radius}px`
	if (index === totalCells - 1) return gapBefore ? `${radius}px` : `0 ${radius}px ${radius}px 0`
	if (gapBefore && gapAfter) return `${radius}px`
	if (gapBefore && !gapAfter) return `${radius}px 0 0 ${radius}px`
	if (!gapBefore && gapAfter) return `0 ${radius}px ${radius}px 0`
	return '0'
}

// Text animation variants with some easing
const textVariants = {
	initial: { opacity: 0, x: -100 },
	animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
	exit: { opacity: 0, x: 100, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } }
}

// This is the title that runs along the top of frame
const WeatherHeader = ({ title, subtitle, config }) => {

	return (
		<>
			<motion.div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					width: '100%',
					height: `${config.header.headerHeight}px`,
					background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.85) 0%, rgba(0, 21, 64, 1) 100%)',
					display: 'flex',
					alignItems: 'center',
					backdropFilter: 'blur(10px) saturate(50%)'
				}}
			>
				<AnimatePresence mode="wait">
					<motion.div key={title} variants={textVariants} initial="initial" animate="animate" exit="exit"
						style={{ width: '100%', marginLeft: `${config.panel.screenMargin}%` }}>
						<div style={{
							color: 'white',
							fontSize: '3rem',
							fontWeight: '900',
							letterSpacing: '2px',
							fontFamily: 'Roboto, Arial, sans-serif',
							margin: 0,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap'
						}}>
							{title}
						</div>
					</motion.div>
				</AnimatePresence>
			</motion.div>

			<motion.div
				style={{
					position: 'absolute',
					top: `${config.header.headerHeight}px`,
					left: 0,
					right: 0,
					width: '100%',
					height: `${config.header.subheaderHeight}px`,
					background: 'rgba(252, 252, 252, 0.85)',
					backdropFilter: 'blur(10px) saturate(140%)',
					display: 'flex',
					alignItems: 'center'
				}}
			>
				<AnimatePresence mode="wait">
					<motion.div key={subtitle} variants={textVariants} initial="initial" animate="animate" exit="exit"
						style={{ width: '100%', marginLeft: `${config.panel.screenMargin}%` }}>
						<div style={{
							color: '#1f2937',
							fontSize: '1.5rem',
							fontWeight: '600',
							letterSpacing: '1px',
							fontFamily: 'Roboto, Arial, sans-serif',
							margin: 0,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap'
						}}>
							{subtitle}
						</div>
					</motion.div>
				</AnimatePresence>
			</motion.div>
		</>
	)
}

const CellContent = ({ cell, config, fontSize, textAlign }) => {
	return (
		<div style={{
			fontSize,
			textAlign,
			width: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
			overflow: 'hidden',
			position: 'relative',
			zIndex: 1
		}}>
			{cell.prefix && (
				<span style={{ fontSize: config.fonts.prefixSuffixFontSize, marginRight: '0.25rem', fontWeight: '500' }}>
					{cell.prefix}
				</span>
			)}
			<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
				{cell.value}
			</span>
			{cell.suffix && (
				<span style={{ fontSize: config.fonts.prefixSuffixFontSize, marginLeft: '0.25rem', fontWeight: '500' }}>
					{cell.suffix}
				</span>
			)}
		</div>
	)
}

// Every row contains groups, and each group contains cells (the individual boxes for weather data vals)
const Row = ({ row, index, totalRows, config: globalConfig }) => {

	// Check if this is a title row (like a header) or a regular data row
	const isTitle = row.type === 'title'

	// Merge row specific overrides
	const config = {
		...globalConfig,
		fonts: {
			...globalConfig.fonts,
			...(row.titleRowFontSize !== undefined && { titleRowFontSize: row.titleRowFontSize }),
			...(row.titleRowValueFontSize !== undefined && { titleRowValueFontSize: row.titleRowValueFontSize }),
			...(row.labelFontSize !== undefined && { labelFontSize: row.labelFontSize }),
			...(row.valueFontSize !== undefined && { valueFontSize: row.valueFontSize }),
			...(row.prefixSuffixFontSize !== undefined && { prefixSuffixFontSize: row.prefixSuffixFontSize })
		},
		rows: {
			...globalConfig.rows,
			...(row.dataTitleRowPaddingTop !== undefined && { dataTitleRowPaddingTop: row.dataTitleRowPaddingTop }),
			...(row.dataTitleRowPaddingBottom !== undefined && { dataTitleRowPaddingBottom: row.dataTitleRowPaddingBottom }),
			...(row.dataRowHeight !== undefined && { dataRowHeight: row.dataRowHeight })
		},
		styling: globalConfig.styling
	}

	const cellContainerShadow = `
		inset 0 0 0 1px ${colorMix('white', 0.1)},
		inset 1px 1px 0px -1px ${colorMix('white', 0.6)},
		inset -1px -1px 0px -1px ${colorMix('white', 0.5)},
		inset -1px 1.5px 2px -1px ${colorMix('black', 0.15)},
		0px 2px 4px 0px ${colorMix('black', 0.06)}
	`

	// Calculate the height of this row
	// Title rows can be auto height, data rows have a fixed height
	const cellHeight = row.dataRowHeight !== undefined ? `${row.dataRowHeight}px` :
		(isTitle ? '50px' : `${config.rows.dataRowHeight}px`)

	// Get animation settings for this row (can override at row level)
	const rowEntranceAnimation = row.entranceAnimation || config.animation.entranceAnimation
	const rowExitAnimation = row.exitAnimation || config.animation.exitAnimation

	// Determine animation order (top-to-bottom or bottom-to-top)
	const entranceOrder = rowEntranceAnimation.startFrom
	const exitOrder = rowExitAnimation.startFrom

	// Calculate animation delays based on row position
	// This creates a row start offset effect
	const animationRowDelayOffset = 0.03
	const baseDelay = entranceOrder === 'bottom-to-top'
		? (totalRows - 1 - index) * animationRowDelayOffset  // Bottom rows animate first
		: index * animationRowDelayOffset                      // Top rows animate first
	const exitDelay = exitOrder === 'bottom-to-top'
		? (totalRows - 1 - index) * animationRowDelayOffset
		: index * animationRowDelayOffset

	// Calculate padding for title rows
	const paddingTop = isTitle ?
		(index === 0 ? '0' : `${config.rows.dataTitleRowPaddingTop}px`) : '0'
	const paddingBottom = isTitle ?
		(index === totalRows - 1 ? '0' : `${config.rows.dataTitleRowPaddingBottom}px`) : '0'

	return (

		// Outer container for the row with vertical padding
		<div style={{
			display: 'flex',
			alignItems: 'center',
			paddingTop,
			paddingBottom,
			height: isTitle ? 'auto' : cellHeight
		}}>

			{/* Inner container that holds all the groups horizontally */}
			<div style={{ display: 'flex', width: '100%', height: cellHeight }}>

				{/* Loop through each group in the row */}
				{row.groups.map((group, groupIndex) => {

					const groupCells = group.cells || []

					// Get animation settings for this group (can override row animations — see the NRL example where each side of teams animates in differently)
					const groupEntranceAnimation = group.entranceAnimation || rowEntranceAnimation
					const groupExitAnimation = group.exitAnimation || rowExitAnimation

					// Create animation variants for this group's entrance and exit
					const groupEntranceVariants = createAnimationVariants(groupEntranceAnimation.direction, 'entrance')
					const groupExitVariants = createAnimationVariants(groupExitAnimation.direction, 'exit')

					return (

						// Animated container for this group
						// Groups slide in from their set direction
						<motion.div
							key={`group-${groupIndex}`}
							initial={groupEntranceVariants.initial}
							animate={{
								...groupEntranceVariants.animate,
								transition: {
									...groupEntranceVariants.animate.transition,
									// Add a small delay for each group in the row
									delay: baseDelay + groupIndex * 0.02
								}
							}}
							exit={{
								...groupExitVariants.exit,
								transition: {
									...groupExitVariants.exit.transition,
									delay: exitDelay + groupIndex * 0.02
								}
							}}
							style={{
								width: `${group.width}%`,  // Width as percentage of row
								height: '100%',
								display: 'flex',
								alignItems: 'center'
							}}
						>

							{/* Cells in the group */}
							{groupCells.map((cell, cellIndex) => {
								// Determine text alignment (left, center, or right)
								const textAlign = cell.textAlign || 'center'
								const justifyContent = textAlign === 'left' ? 'flex-start' :
									textAlign === 'right' ? 'flex-end' : 'center'



								return (
									<React.Fragment key={cellIndex}>
										{/* The cell */}
										<div
											style={{
												width: `${cell.width}%`,    // Width as percentage of group
												height: '100%',
												fontWeight: isTitle ? '800' : '600',  // Bold for titles
												color: getTextColor(cell.color),
												background: (colorDefinitions[cell.color] || colorDefinitions.blue),
												display: 'flex',
												alignItems: 'center',
												justifyContent,
												fontFamily: 'Roboto, Arial, sans-serif',
												padding: cell.type === 'text' ? '0 1rem' : '0 0.5rem',
												borderRadius: getCellBorderRadius(cellIndex, groupCells.length, groupCells, config),
												textShadow: isTitle ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
												boxShadow: cell.color !== 'clear' ? cellContainerShadow : 'none',
												overflow: 'hidden',
												position: 'relative'  // Needed for overlay image positioning
											}}
										>
											{/* Optional background overlay image (like team logos in NRL preste) */}
											{cell.cellOverlayImage && (
												<div style={{
													position: 'absolute',
													top: 0,
													left: 0,
													right: 0,
													bottom: 0,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													opacity: cell.cellOverlayOpacity || 0.2,  // Semi-transparent for overlay
													zIndex: 0  // Behind the text
												}}>
													{/* Scale up the NRL lgos so fills the cell better */}
													<div style={{
														width: cell.cellOverlayFit === 'width' ? '110%' :
															cell.cellOverlayFit === 'height' ? 'auto' : '110%',
														height: cell.cellOverlayFit === 'height' ? '110%' :
															cell.cellOverlayFit === 'width' ? 'auto' : '110%',
														backgroundImage: `url(${cell.cellOverlayImage})`,
														backgroundSize: cell.cellOverlayFit === 'width' ? 'contain' :
															cell.cellOverlayFit === 'height' ? 'auto 100%' :
																cell.cellOverlayFit === 'cover' ? 'cover' : 'contain',
														backgroundPosition: 'center',
														backgroundRepeat: 'no-repeat',

														// Special sizing for width/height fit modes
														...(cell.cellOverlayFit === 'width' && {
															backgroundSize: '110% auto',
															height: '110%'
														}),
														...(cell.cellOverlayFit === 'height' && {
															backgroundSize: 'auto 110%',
															width: '110%'
														})
													}} />
												</div>
											)}

											{/* The cell text (town, temp etc) */}
											<CellContent
												cell={cell}
												config={config}
												fontSize={
													isTitle ?
														(cell.type === 'text' ? config.fonts.titleRowFontSize : config.fonts.titleRowValueFontSize) :
														(cell.type === 'text' ? config.fonts.labelFontSize : config.fonts.valueFontSize)
												}
												textAlign={textAlign}
											/>
										</div>

										{/* Optional gap between cells (creates visual separation) */}
										{cell.gap > 0 && cellIndex < groupCells.length - 1 && (
											<div style={{ width: `${cell.gap}px`, flexShrink: 0 }} />
										)}
									</React.Fragment>
								)
							})}
						</motion.div>
					)
				})}
			</div>
		</div>
	)
}

const WeatherPanel = ({ rowChildren, config, panelHeight, show }) => {

	// Glass look ... just an example to show design possibilities / capabilities
	const glassBoxShadow = `
		inset 0 0 0 1px ${colorMix('white', 0.15)},
		inset 2px 4px 0px -2px ${colorMix('white', 0.8)},
		inset -2px -2px 0px -2px ${colorMix('white', 0.7)},
		inset -4px -10px 2px -8px ${colorMix('white', 0.5)},
		inset -0.5px -2px 6px 0px ${colorMix('black', 0.15)},
		inset -2px 3px 0px -2px ${colorMix('black', 0.25)},
		inset 0px 4px 6px -3px ${colorMix('black', 0.25)},
		inset 3px -8px 2px -5px ${colorMix('black', 0.12)},
		0px 2px 8px 0px ${colorMix('black', 0.12)},
		0px 10px 30px 0px ${colorMix('black', 0.1)}
	`

	return (
		<AnimatePresence>
			{show && (
				<motion.div
					initial={{
						opacity: 0,
						y: 50
					}}
					animate={{
						opacity: 1,
						y: 0,
						width: `${config.panel.panelWidth}%`,
						height: panelHeight
					}}
					exit={{
						opacity: 0,
						y: 20
					}}
					transition={{
						opacity: { duration: 0.5 },
						y: { duration: 0.5 },
						height: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
						width: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
					}}
					style={{
						position: 'absolute',
						top: `${config.header.headerHeight + config.header.subheaderHeight + config.panel.headerPanelGap}px`,
						left: `${config.panel.screenMargin}%`,
						backgroundColor: colorMix('glass', 0.08),
						backdropFilter: 'blur(15px) saturate(100%)',
						borderRadius: '32px',
						padding: `${config.panel.panelPadding}%`,
						boxShadow: glassBoxShadow,
						overflow: 'hidden'
					}}
				>
					<div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
						{rowChildren}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

const WeatherRows = ({ rowContent, config, onExitComplete }) => {

	const getRowMarginBottom = (index) => {
		if (index >= rowContent.length - 1) return 0

		const currentRow = rowContent[index]
		const nextRow = rowContent[index + 1]
		const gap = currentRow.dataRowSpacing !== undefined ? currentRow.dataRowSpacing : config.rows.dataRowSpacing

		if (currentRow.type !== 'title' && nextRow.type !== 'title') {
			return gap
		}
		return 0
	}

	return (
		<AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
			<motion.div
				key={JSON.stringify(rowContent.map(row =>
					row.groups?.[0]?.cells?.[0]?.value || ''
				))}
				style={{ display: 'flex', flexDirection: 'column' }}
			>
				{rowContent.map((row, index) => (
					<div
						key={`${row.groups?.[0]?.cells?.[0]?.value || ''}-${index}`}
						style={{ marginBottom: `${getRowMarginBottom(index)}px` }}
					>
						<Row
							row={row}
							index={index}
							totalRows={rowContent.length}
							config={config}
						/>
					</div>
				))}
			</motion.div>
		</AnimatePresence>
	)
}

const WeatherDisplay = () => {

	const data = useCasparData()

	const config = {
		...defaultConfig,
		...(data?.config && {
			header: { ...defaultConfig.header, ...data.config.header },
			panel: { ...defaultConfig.panel, ...data.config.panel },
			rows: { ...defaultConfig.rows, ...data.config.rows },
			fonts: { ...defaultConfig.fonts, ...data.config.fonts },
			styling: { ...defaultConfig.styling, ...data.config.styling },
			animation: { ...defaultConfig.animation, ...data.config.animation }
		})
	}

	const weatherData = data?.weatherData || { rows: [] }
	const title = data?.title || ''
	const subtitle = data?.subtitle || ''
	const newBackgroundURL = data?.backgroundImage || config.styling.backgroundImage || ''

	// State for displayed and preloading backgrounds
	const [currentBackgroundURL, setcurrentBackgroundURL] = useState(newBackgroundURL)
	const [preloadBackgroundUrl, setPreloadBackgroundUrl] = useState(null)

	// Load both current and preload backgrounds
	const backgroundImage = useImage({ src: currentBackgroundURL })
	const preloadImage = useImage({ src: preloadBackgroundUrl })

	useEffect(() => {
		if (newBackgroundURL !== currentBackgroundURL) {
			setPreloadBackgroundUrl(newBackgroundURL)
		}
	}, [newBackgroundURL, currentBackgroundURL])

	const pageVisible = data !== null && data !== undefined
	const panelVisible = data && data.showPanel !== false && data.weatherData
	const rowContent = weatherData.rows.filter(row => row.groups && row.groups.length > 0)

	// Swap to new background after exit animation completes
	const handleContentExitComplete = () => {
		if (newBackgroundURL !== currentBackgroundURL) {
			setcurrentBackgroundURL(newBackgroundURL)
			setPreloadBackgroundUrl(null)
		}
	}

	const calculatePanelHeight = () => {
		let height = 0
		rowContent.forEach((row, index) => {
			if (row.type === 'title') {
				const paddingTop = index === 0 ? 0 : (row.dataTitleRowPaddingTop ?? config.rows.dataTitleRowPaddingTop)
				const paddingBottom = index === rowContent.length - 1 ? 0 : (row.dataTitleRowPaddingBottom ?? config.rows.dataTitleRowPaddingBottom)
				const boxHeight = row.dataRowHeight ?? 50
				height += paddingTop + boxHeight + paddingBottom
			} else {
				const boxHeight = row.dataRowHeight ?? config.rows.dataRowHeight
				height += boxHeight
			}

			if (index < rowContent.length - 1) {
				const nextRow = rowContent[index + 1]
				const gap = row.dataRowSpacing ?? config.rows.dataRowSpacing
				if (row.type !== 'title' && nextRow.type !== 'title') {
					height += gap
				}
			}
		})
		return height
	}

	const panelHeight = calculatePanelHeight()

	return (
		<FramerMotion hide={!pageVisible}>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
				style={{
					width: '100vw',
					height: '100vh',
					position: 'absolute',
					top: 0,
					left: 0,
					overflow: 'hidden',
					backgroundColor: '#000'
				}}
			>
				{backgroundImage?.src && (
					<div style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						backgroundImage: `url(${backgroundImage.src})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center'
					}} />
				)}
				<div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
					<WeatherHeader title={title} subtitle={subtitle} config={config} />
					<WeatherPanel
						config={config}
						panelHeight={panelHeight}
						show={panelVisible}
						rowChildren={
							<WeatherRows
								rowContent={rowContent}
								config={config}
								onExitComplete={handleContentExitComplete} /// Change background only after exit (will need to pre-load next bg during exit to prevent blank state during transition when loading even from local url)
							/>}
					/>
				</div>
			</motion.div>
		</FramerMotion>
	)
}

render(WeatherDisplay)