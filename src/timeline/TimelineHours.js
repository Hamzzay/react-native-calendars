import range from 'lodash/range';
import times from 'lodash/times';
import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import constants from '../commons/constants';
import { buildTimeString, calcTimeByPosition, calcDateByPosition } from './helpers/presenter';
import { buildUnavailableHoursBlocks, HOUR_BLOCK_HEIGHT } from './Packer';
const dimensionWidth = constants.screenWidth;
const EVENT_DIFF = 20;
const TimelineHours = (props) => {
    const { format24h, start = 0, end = 24, date, unavailableHours, unavailableHoursColor, styles, onBackgroundLongPress, onBackgroundLongPressOut, width, numberOfDays = 1, timelineLeftInset = 0, blockDays } = props;
    const lastLongPressEventTime = useRef();

    // const offset = this.calendarHeight / (end - start);
    const offset = HOUR_BLOCK_HEIGHT;

    const blockDaysBlocks = buildUnavailableHoursBlocks(blockDays, { dayStart: start, dayEnd: end })
    const unavailableHoursBlocks = buildUnavailableHoursBlocks(unavailableHours, { dayStart: start, dayEnd: end });
    const hours = useMemo(() => {
        return range(start, end + 1).map(i => {
            let timeText;
            if (i === start) {
                timeText = '';
            }
            else if (i < 12) {
                timeText = !format24h ? `${i} AM` : `${i}:00`;
            }
            else if (i === 12) {
                timeText = !format24h ? `${i} PM` : `${i}:00`;
            }
            else if (i === 24) {
                timeText = !format24h ? '12 AM' : '23:59';
            }
            else {
                timeText = !format24h ? `${i - 12} PM` : `${i}:00`;
            }
            return { timeText, time: i };
        });
    }, [start, end, format24h]);
    const handleBackgroundPress = useCallback(event => {
        const yPosition = event.nativeEvent.locationY;
        const xPosition = event.nativeEvent.locationX;
        const { hour, minutes } = calcTimeByPosition(yPosition, HOUR_BLOCK_HEIGHT);
        const dateByPosition = calcDateByPosition(xPosition, timelineLeftInset, numberOfDays, date);
        lastLongPressEventTime.current = { hour, minutes, date: dateByPosition };
        const timeString = buildTimeString(hour, minutes, dateByPosition);
        onBackgroundLongPress?.(timeString, lastLongPressEventTime.current);
    }, [onBackgroundLongPress, date]);
    const handlePressOut = useCallback(() => {
        if (lastLongPressEventTime.current) {
            const { hour, minutes, date } = lastLongPressEventTime.current;
            const timeString = buildTimeString(hour, minutes, date);
            onBackgroundLongPressOut?.(timeString, lastLongPressEventTime.current);
            lastLongPressEventTime.current = undefined;
        }
    }, [onBackgroundLongPressOut, date]);
    return (<>
      <TouchableWithoutFeedback onLongPress={handleBackgroundPress} onPressOut={handlePressOut}>
        <View style={StyleSheet.absoluteFillObject}/>
        </TouchableWithoutFeedback>
        
        {blockDaysBlocks.map(block => (<View style={[
                styles.unavailableHoursBlock,
                block,
                unavailableHoursColor ? { backgroundColor: '#E8E6E6' } : undefined,
            { left: timelineLeftInset },
                {borderRadius: 10, borderColor: "#AFABAB", borderWidth: 2}
        ]}>
            <Text style={{color:"#808080", fontWeight: "bold", padding: 10, }}>
                Out of office
            </Text>
            </View>))}

      {unavailableHoursBlocks.map(block => (<View style={[
                styles.unavailableHoursBlock,
                block,
                unavailableHoursColor ? { backgroundColor: unavailableHoursColor } : undefined,
                { left: timelineLeftInset }
            ]}></View>))}

      {hours.map(({ timeText, time }, index) => {
            return (<React.Fragment key={time} >
            <Text key={`timeLabel${time}`} style={[styles.timeLabel, { top: offset * index - 6, width: timelineLeftInset - 16 }]}>
              {timeText}
            </Text>
            {time === start ? null : (<View key={`line${time}`} style={[styles.line, { top: offset * index, width: dimensionWidth - EVENT_DIFF, left: timelineLeftInset - 16 }]}/>)}
            {<View key={`lineHalf${time}`} style={[styles.line, { top: offset * (index + 0.5), width: dimensionWidth - EVENT_DIFF, left: timelineLeftInset - 16 }]}/>}
          </React.Fragment>);
        })}
      {times(numberOfDays, (index) => <View style={[styles.verticalLine, { right: (index + 1) * width / numberOfDays }]}/>)}
    </>);
};
export default React.memo(TimelineHours);
