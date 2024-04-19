document.addEventListener('DOMContentLoaded', function() {
    const autoAssignBtn = document.getElementById('auto-assign-btn');

    let autoAssignStatus = localStorage.getItem('autoAssign');
    if (autoAssignStatus === null) {
        autoAssignStatus = '1';
        localStorage.setItem('autoAssign', autoAssignStatus);
    }

    updateButtonState(autoAssignStatus);

    autoAssignBtn.addEventListener('click', function() {
        if (autoAssignStatus === '1') {
            autoAssignStatus = '0';
            localStorage.setItem('autoAssign', autoAssignStatus);
        } else {
            autoAssignStatus = '1';
            localStorage.setItem('autoAssign', autoAssignStatus);
        }
        updateButtonState(autoAssignStatus);
    });

    const schedulingPeriod = JSON.parse(localStorage.getItem('schedulingPeriod'));
    const services = JSON.parse(localStorage.getItem('services'));
    const soldiers = JSON.parse(localStorage.getItem('soldiers'));

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of the current year
    const nextYearStartDate = new Date(currentYear + 1, 0, 1); // January 1st of the next year

    // Calculate the difference in milliseconds between the two dates and convert it to days
    const totalDaysInYear = Math.floor((nextYearStartDate - startDate) / (1000 * 60 * 60 * 24));

    let schedulingDates = [];
    if (schedulingPeriod) {
        schedulingDates = [new Date(schedulingPeriod.startDate), new Date(schedulingPeriod.endDate)];
    }

    if (autoAssignStatus == 1) {
        soldiers.forEach(soldier => {
            soldier.serviceHistory = new Array(totalDaysInYear).fill(0);
        });
    
        localStorage.setItem('soldiers', JSON.stringify(soldiers));
    
        for (let day = schedulingDates[0]; day <= schedulingDates[1]; day.setDate(day.getDate() + 1)) {
            const dayOfYear = getDayOfYear(day);
            const availableServices = services.filter(service => {
                return service.availability[dayOfYear] == 1;
            });

            if (availableServices.length === 0) {
                //console.log(`No available services for day ${day}.`);
                continue; // Skip to the next day
            }

            const gunServices = availableServices.filter(service => {
                return service.type == "gun";
            });

            const noGunServices = availableServices.filter(service => {
                return service.type == "no-gun";
            });

            const availableSoldiers = soldiers.filter(soldier => {
                return soldier.availability[dayOfYear] == 1;
            });

            if (availableSoldiers.length === 0) {
                //console.log(`No available soldiers for day ${day}.`);
                continue; // Skip to the next day
            }

            const gunSoldiers = availableSoldiers.filter(soldier => {
                return soldier.type == "gun";
            });

            const noGunSoldiers = availableSoldiers.filter(soldier => {
                return soldier.type == "no-gun";
            });

            if (gunSoldiers.length < gunServices.length) {
                // Alert if there are more services than available soldiers
                alert(`Not enough soldiers available for day ${day}.`);
                continue; // Skip to the next day
            }

            if (gunSoldiers.length > 0 && gunServices.length > 0) {
                // Sort the gun soldiers so that we prioratize the ones that haven't done the service the most,
                // have the longest time to do this service, or randomly sort them.

                gunServices.forEach(service => {
                    gunSoldiers.sort((a, b) => {
                        // Count the occurrences of service.id in each soldier's serviceHistory
                        const countA = a.serviceHistory.filter(id => id === service.id).length;
                        const countB = b.serviceHistory.filter(id => id === service.id).length;

                        // If counts are equal, prioritize the soldier with earlier occurrence in serviceHistory
                        if (countA === countB) {
                            // Find the index of the latest occurrence of service.id in serviceHistory
                            const latestIndexA = a.serviceHistory.findIndex(id => id === service.id);
                            const latestIndexB = b.serviceHistory.findIndex(id => id === service.id);

                            // Handle case where index is -1 (element not found)
                            if (latestIndexA === -1 && latestIndexB === -1) {
                                if (findConsecutiveDaysOfService(a.serviceHistory,dayOfYear) > findConsecutiveDaysOfService(b.serviceHistory,dayOfYear)) {
                                    return -1;
                                } else if (findConsecutiveDaysOfService(a.serviceHistory,dayOfYear) == findConsecutiveDaysOfService(b.serviceHistory,dayOfYear)) {
                                    return Math.random() - 0.5;
                                } else {
                                    return 1;
                                }
                            } else if (latestIndexA === -1) {
                                // If index A is -1, treat A as greater than B
                                return 1;
                            } else if (latestIndexB === -1) {
                                // If index B is -1, treat B as greater than A
                                return -1;
                            }
                            
                            if (latestIndexA === latestIndexB) {
                                if (findConsecutiveDaysOfService(a.serviceHistory,dayOfYear) > findConsecutiveDaysOfService(b.serviceHistory,dayOfYear)) {
                                    return -1;
                                } else if (findConsecutiveDaysOfService(a.serviceHistory,dayOfYear) == findConsecutiveDaysOfService(b.serviceHistory,dayOfYear)) {
                                    return Math.random() - 0.5;
                                } else {
                                    return 1;
                                }                      }
                            // Sort based on the index of the latest occurrence
                            return latestIndexB - latestIndexA;
                        }
                
                        // Sort in descending order based on the count of service.id occurrences
                        return countB - countA;
                    });

                    const soldier = gunSoldiers.pop();
                    // Update the soldier's service history for the current day and service
                    soldier.serviceHistory[dayOfYear] = service.id;
                    const soldierToUpdate = soldiers.find(soldier => soldier.id === soldier.id);

                    // Find the index of the soldier to update
                    const indexToUpdate = soldiers.findIndex(soldier => soldier.id === soldier.id);

                    if (indexToUpdate !== -1 && soldierToUpdate) {
                        // Replace the soldier at the found index with the updated soldier
                        soldiers[indexToUpdate] = soldierToUpdate;
                    } else {
                        console.error('Soldier not found with ID:', soldier.id);
                    }
                });
            } else {
                //console.log(`No gun soldiers or gun services available for day ${day}.`);
            }

            const allSoldiers = gunSoldiers.concat(noGunSoldiers);

            if (allSoldiers.length < noGunServices.length) {
                // Alert if there are more services than available soldiers
                alert(`Not enough soldiers available for day ${day}.`);
                continue; // Skip to the next day
            }

            if (allSoldiers.length > 0 && noGunServices.length > 0) {
                noGunServices.forEach(service => {
                    // Sort allSoldiers based on latest occurance of specific service.
                    allSoldiers.sort((a, b) => {
                        // Count the occurrences of service.id in each soldier's serviceHistory
                        const countA = a.serviceHistory.filter(id => id === service.id).length;
                        const countB = b.serviceHistory.filter(id => id === service.id).length;
                        // If counts are equal, prioritize the soldier with earlier occurrence in serviceHistory
                        if (countA === countB) {
                            // Find the index of the latest occurrence of service.id in serviceHistory
                            const latestIndexA = a.serviceHistory.findIndex(id => id === service.id);
                            const latestIndexB = b.serviceHistory.findIndex(id => id === service.id);

                            // Handle case where index is -1 (element not found)
                            if (latestIndexA === -1 && latestIndexB === -1) {
                                if (findConsecutiveDaysOfService(a.serviceHistory,dayOfYear) > findConsecutiveDaysOfService(b.serviceHistory,dayOfYear)) {
                                    return -1;
                                } else if (findConsecutiveDaysOfService(a.serviceHistory,dayOfYear) == findConsecutiveDaysOfService(b.serviceHistory,dayOfYear)) {
                                    return Math.random() - 0.5;
                                } else {
                                    return 1;
                                }
                            } else if (latestIndexA === -1) {
                                // If index A is -1, treat A as greater than B
                                return 1;
                            } else if (latestIndexB === -1) {
                                // If index B is -1, treat B as greater than A
                                return -1;
                            }

                            if (latestIndexA === latestIndexB) {
                                if (findConsecutiveDaysOfService(a.serviceHistory,dayOfYear) > findConsecutiveDaysOfService(b.serviceHistory,dayOfYear)) {
                                    return -1;
                                } else if (findConsecutiveDaysOfService(a.serviceHistory,dayOfYear) == findConsecutiveDaysOfService(b.serviceHistory,dayOfYear)) {
                                    return Math.random() - 0.5;
                                } else {
                                    return 1;
                                }
                            }
                            // Sort based on the index of the latest occurrence
                            return latestIndexB - latestIndexA;
                        }
                
                        // Sort in descending order based on the count of service.id occurrences
                        return countB - countA;
                    });

                    let soldier = allSoldiers.pop();

                    if (soldier.type === "gun") {
                        allSoldiers.push(soldier);
                        
                        // Sort allSoldiers based on latest occurance of a 0 before a service (values non zero).
                        allSoldiers.sort((a, b) => {
                            // Find the index of the last zero before nonzero values in serviceHistory
                            const servicesA = findConsecutiveDaysOfService(a.serviceHistory,dayOfYear);
                            const servicesB = findConsecutiveDaysOfService(b.serviceHistory,dayOfYear);

                            // If both soldiers have zeros in their service history
                            if (servicesA !== 0 && servicesB !== 0) {
                                // Sort based on the index of the last zero (in descending order)
                                if (servicesA === servicesB) {
                                    // If the last zero index is the same, sort randomly
                                    if (a.type === "gun") {
                                        return -1;
                                    } else if (b.type === "gun"){
                                        return 1;
                                    } else {
                                        return Math.random() - 0.5;
                                    }
                                } else {
                                    return servicesB - servicesA; // Reversed order
                                }
                            } else if (servicesA === 0 && servicesB === 0) {
                                if (a.type === "gun") {
                                    return -1;
                                } else if (b.type === "gun"){
                                    return 1;
                                } else {
                                    return Math.random() - 0.5;
                                }
                            }else if (servicesA === 0) {
                                // Soldier A has a zero in service history, but soldier B doesn't
                                return 1; // Place soldier A after soldier B
                            } else if (servicesB === 0) {
                                // Soldier B has a zero in service history, but soldier A doesn't
                                return -1; // Place soldier B after soldier A
                            } else {
                                // Both soldiers don't have any zeros in service history, sort randomly
                                return Math.random() - 0.5;
                            }
                        });

                        soldier = allSoldiers.pop();
                    }

                    // Update the soldier's service history for the current day and service
                    soldier.serviceHistory[dayOfYear] = service.id;
                    const soldierToUpdate = soldiers.find(soldier => soldier.id === soldier.id);

                    // Find the index of the soldier to update
                    const indexToUpdate = soldiers.findIndex(soldier => soldier.id === soldier.id);

                    if (indexToUpdate !== -1 && soldierToUpdate) {
                        // Replace the soldier at the found index with the updated soldier
                        soldiers[indexToUpdate] = soldierToUpdate;
                    } else {
                        console.error('Soldier not found with ID:', soldier.id);
                    }
                });
            } else {
                //console.log(`No non-gun soldiers or non-gun services available for day ${day}.`);
            }

            // Store the updated soldiers array back in the local storage
            localStorage.setItem('soldiers', JSON.stringify(soldiers));
        };
    } else {
        
    }

    // Find the index of the last zero before having nonzero values
    function findConsecutiveDaysOfService(array, dayOfYear) {
        let consecutiveServicesCounter = 0;

        for (let i = array.length - 1; i >= 1; i--) {
            if (array[dayOfYear] === 0 && array[dayOfYear-1] === 0) {
                break;
            }
            if (array[i] === 0 && array[i-1] === 0) {
                continue;
            } else if (array[i] === 0 && array[i-1] != 0) {
                consecutiveServicesCounter += 1;
            } else if (array[i] != 0 && array[i-1] != 0) {
                consecutiveServicesCounter += 1;
            } else if (array[i] != 0 && array[i-1] === 0) {
                break;
            } else {
                continue;
            }
        }
        return consecutiveServicesCounter;
    }

    function getDayOfYear(date) {
        const startOfYear = new Date(date.getFullYear(), 0, 0);
        const diff = date - startOfYear;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    function updateButtonState(status) {
        if (status === '1') {
            autoAssignBtn.textContent = 'Αυτόματη Ανάθεση ✔️';
        } else {
            autoAssignBtn.textContent = 'Αυτόματη Ανάθεση ❌';
        }
    }
});