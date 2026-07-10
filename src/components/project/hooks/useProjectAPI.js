import { useState, useCallback } from 'react';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth';

const API_URL = "https://api.csaap.com/api/tenantuser/projects";



export const useProjectAPI = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();
    const slug = user?.slug || "";


    const getAuthHeaders = useCallback(() => {
        const rawToken = token || localStorage.getItem("token") || "";
        return rawToken ? { Authorization: `Bearer ${rawToken}` } : {};
    }, [token]);


    const extractIdFromResponse = useCallback((responseData) => {
        if (!responseData) return null;


        if (responseData.id) return responseData.id;
        if (responseData._id) return responseData._id;
        if (responseData.projectId) return responseData.projectId;
        if (responseData.project_id) return responseData.project_id;


        if (responseData.data) {
            if (responseData.data.id) return responseData.data.id;
            if (responseData.data._id) return responseData.data._id;
            if (responseData.data.projectId) return responseData.data.projectId;
            if (responseData.data.project_id) return responseData.data.project_id;
        }


        const findIdInObject = (obj) => {
            for (const [key, value] of Object.entries(obj)) {
                const keyLower = key.toLowerCase();
                if (
                    (keyLower.includes("id") || keyLower.includes("_id")) &&
                    (typeof value === "number" ||
                        (typeof value === "string" && /^\d+$/.test(value)))
                ) {
                    return value;
                }
                if (
                    typeof value === "object" &&
                    value !== null &&
                    !Array.isArray(value)
                ) {
                    const nestedId = findIdInObject(value);
                    if (nestedId) return nestedId;
                }
            }
            return null;
        };

        return findIdInObject(responseData);
    }, []);


    const formatServerErrors = useCallback((err) => {
        const respData = err?.response?.data;
        if (!respData) {
            return err?.message || String(err);
        }

        if (Array.isArray(respData)) {
            return respData.map((i) =>
                typeof i === "string" ? i : JSON.stringify(i)
            );
        }

        if (respData.errors) {
            if (Array.isArray(respData.errors)) {
                return respData.errors.map((e) =>
                    typeof e === "string" ? e : JSON.stringify(e)
                );
            } else if (typeof respData.errors === "object") {
                const messages = [];
                Object.keys(respData.errors).forEach((k) => {
                    const val = respData.errors[k];
                    if (Array.isArray(val)) {
                        val.forEach((m) => messages.push(`${k}: ${m}`));
                    } else {
                        messages.push(`${k}: ${String(val)}`);
                    }
                });
                return messages;
            }
        }

        if (respData.message && typeof respData.message === "string") {
            return respData.message;
        }

        const nested = respData.data || respData.error || respData;
        if (typeof nested === "string") return nested;
        return JSON.stringify(respData);
    }, []);


    const createProject = useCallback(async (projectData) => {
        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                slug,
                name: projectData.name.trim(),
                type: projectData.type.toLowerCase(),
                city: projectData.city || "",
                locality: projectData.locality || "",
                land_zone: projectData.landZone || "",
                total_land_area: projectData.landArea || 0,
                kissama: "Project description",
                boundary_type: "compound_wall",
            };


            if (projectData.priceDetails) {
                const pd = {
                    expected_price: projectData.priceDetails.expectedPrice || "",
                    token_amount: projectData.priceDetails.tokenAmount || "",
                    price_negotiable: !!projectData.priceDetails.priceNegotiable,
                };


                if (pd.expected_price && !isNaN(Number(pd.expected_price))) {
                    pd.expected_price = Number(pd.expected_price);
                }
                if (pd.token_amount && !isNaN(Number(pd.token_amount))) {
                    pd.token_amount = Number(pd.token_amount);
                }


                const hasAny = Object.values(pd).some((v) => v !== undefined && v !== "" && v !== null);
                if (hasAny) {
                    payload.price_details = pd;
                }
            }



            const response = await axios.post(API_URL, payload, {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
            });

            let projectId = extractIdFromResponse(response.data);


            if (!projectId && response.headers?.location) {
                const location = response.headers.location;
                const idMatch = location.match(/\/([0-9a-fA-F-]{3,})$/);
                if (idMatch) {
                    projectId = idMatch[1];
                }
            }

            if (!projectId) {
                throw new Error("No project ID returned from API");
            }


            if (typeof projectId === "string" && /^\d+$/.test(projectId)) {
                projectId = parseInt(projectId, 10);
            }


            return { id: projectId, data: response.data };

        } catch (err) {
            const errorMessage = formatServerErrors(err);
            setError(errorMessage);
            console.error("Create project error:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, extractIdFromResponse, formatServerErrors, slug]);


    const updateProject = useCallback(async (projectId, projectData) => {
        if (!projectId) {
            throw new Error("No project ID provided for update");
        }

        setIsLoading(true);
        setError(null);

        try {
            const endpoint = `${API_URL}/${projectId}`;
            const payload = {
                slug,
                name: projectData.name,
                type: projectData.type.toLowerCase(),
                city: projectData.city || "",
                locality: projectData.locality || "",
                land_zone: projectData.landZone || "",
                total_land_area: projectData.landArea || 0,
                total_blocks: projectData.totalBlocks || 0,
                total_units: projectData.totalUnits || 0,
                kissama: "Project description",
                boundary_type: "compound_wall",
                broker_id: projectData.broker || null,
                purchaser: projectData.purchaser || "",
                constructor: projectData.constructor || "",
                staff_engaged: projectData.staffEngaged || "",
                loan_provider: projectData.loanProvider || "",
                loan: projectData.loan || "",
            };


            if (projectData.priceDetails) {
                const pd = {
                    expected_price: projectData.priceDetails.expectedPrice || null,
                    token_amount: projectData.priceDetails.tokenAmount || null,
                    price_negotiable: !!projectData.priceDetails.priceNegotiable,
                };

                if (pd.expected_price && !isNaN(Number(pd.expected_price))) {
                    pd.expected_price = Number(pd.expected_price);
                }
                if (pd.token_amount && !isNaN(Number(pd.token_amount))) {
                    pd.token_amount = Number(pd.token_amount);
                }

                const hasAny = Object.values(pd).some((v) => v !== undefined && v !== null && v !== "");
                if (hasAny) {
                    payload.price_details = pd;
                }
            }



            const response = await axios.put(endpoint, payload, {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
            });


            return response.data;

        } catch (err) {
            const errorMessage = formatServerErrors(err);
            setError(errorMessage);
            console.error("Update project error:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, formatServerErrors, slug]);


    const createBlock = useCallback(async (projectId, blockData) => {
        if (!projectId) {
            throw new Error("Project ID required to create block");
        }

        setIsLoading(true);
        setError(null);

        try {
            const endpoint = `${API_URL}/${projectId}/blocks`;
            const payload = {
                slug,
                block_name: blockData.name,
                prefix: blockData.prefix,
                total_units: blockData.totalUnits || 1,
                parking_floors: blockData.parkingFloors || 0,
                residential_floors: blockData.residentialFloors || 1,
                description: blockData.description || `Block ${blockData.name}`,
            };

            const response = await axios.post(endpoint, payload, {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
            });

            const blockId = extractIdFromResponse(response.data);
            if (!blockId) {
                throw new Error("No block ID returned from API");
            }

            return blockId;

        } catch (err) {
            const errorMessage = formatServerErrors(err);
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, extractIdFromResponse, formatServerErrors, slug]);


    const updateBlock = useCallback(async (projectId, blockId, blockData) => {
        if (!projectId || !blockId) {
            throw new Error("Project and block IDs required");
        }

        setIsLoading(true);
        setError(null);

        try {
            const endpoint = `${API_URL}/${projectId}/blocks/${blockId}`;
            const payload = {
                slug,
                block_name: blockData.name,
                prefix: blockData.prefix,
                total_units: blockData.totalUnits || 1,
                parking_floors: blockData.parkingFloors || 0,
                residential_floors: blockData.residentialFloors || 1,
                description: blockData.description || `Block ${blockData.name}`,
            };

            const response = await axios.put(endpoint, payload, {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
            });

            return response.data;

        } catch (err) {
            const errorMessage = formatServerErrors(err);
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, formatServerErrors, slug]);


    const createUnit = useCallback(async (projectId, unitData) => {
        if (!projectId || !unitData.blockId) {
            throw new Error("Project and block IDs required");
        }

        setIsLoading(true);
        setError(null);

        try {
            const endpoint = `${API_URL}/${projectId}/units`;
            const unitName = unitData.name || `Unit-${Date.now()}`;

            const payload = {
                slug,
                project_id: projectId,
                block_id: unitData.blockId,
                name: unitName,
                unit_name: unitName,
                floor_number: unitData.floorNumber || 1,
                floor_name: unitData.floor || "Floor 1",
                room_type: unitData.roomType || "1BHK",
                carpet_area: unitData.areaDetails?.carpetArea || 0,
                builtup_area: unitData.areaDetails?.builtUpArea || 0,
                super_builtup_area: unitData.areaDetails?.superBuiltUpArea || 0,
                balconies: unitData.propertyFeatures?.balconies || 0,
                bathrooms: unitData.propertyFeatures?.bathrooms || 0,
                bedrooms: unitData.propertyFeatures?.bedrooms || 0,
                furnished_status: unitData.propertyFeatures?.furnishedStatus || "Unfurnished",
                total_built_up_area: unitData.areaDetails?.builtUpArea || 0,
            };


            if (unitData.priceDetails?.expectedPrice) payload.price = unitData.priceDetails.expectedPrice;
            if (unitData.broker) payload.broker = unitData.broker;
            if (unitData.purchaser) payload.purchaser = unitData.purchaser;
            if (unitData.constructor) payload.constructor = unitData.constructor;
            if (unitData.staffEngaged) payload.staff_engaged = unitData.staffEngaged;
            if (unitData.loanProvider) payload.loan_provider = unitData.loanProvider;
            if (unitData.loan) payload.loan = unitData.loan;

            const response = await axios.post(endpoint, payload, {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
            });

            const unitId = extractIdFromResponse(response.data);
            return unitId || { success: true, data: response.data };

        } catch (err) {
            const errorMessage = formatServerErrors(err);
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, extractIdFromResponse, formatServerErrors, slug]);


    const createFloorDetails = useCallback(async (projectId, unitId, floorData) => {
        if (!projectId || !unitId) {
            throw new Error("Project and unit IDs required");
        }

        setIsLoading(true);
        setError(null);

        try {
            const endpoint = `${API_URL}/${projectId}/units/${unitId}/floor-details`;
            const payload = {
                slug,
                floor_name: floorData.floorName || `Floor ${floorData.floorNumber}`,
                floor_no: floorData.floorNumber || 1,
                balconies: floorData.balcony || 0,
                bathrooms: floorData.totalBathrooms || 0,
                bedrooms: floorData.totalBedrooms || 0,
                room_type: floorData.roomType || "1BHK",
                furnished_status: floorData.furnishedStatus || "Unfurnished",
                total_built_up_area: floorData.totalBuiltUpArea || 0,
                carpet_area: floorData.carpetArea || 0,
                super_built_up_area: floorData.superBuiltUpArea || 0,
                bedroom_area: floorData.bedroomArea || 0,
                bathroom_area: floorData.bathroomArea || 0,
                living_area: floorData.livingArea || 0,
                dining_area: floorData.diningArea || 0,
                study_room: floorData.studyRoom || 0,
                study_room_area: floorData.studyRoomArea || 0,
                balcony_area: floorData.balconyArea || 0,
            };

            const response = await axios.post(endpoint, payload, {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
            });

            return response.data;

        } catch (err) {
            const errorMessage = formatServerErrors(err);
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, formatServerErrors, slug]);



    const fetchRevenuePlots = useCallback(async (projectId) => {
        if (!projectId) return [];
        try {
            const response = await axios.get(`${API_URL}/${projectId}/revenue-plots`, {
                params: {
                    slug,
                    subdomain: slug
                },
                headers: getAuthHeaders()
            });
            return response.data?.data || [];
        } catch (err) {
            console.error("Fetch revenue plots error:", err);
            return [];
        }
    }, [getAuthHeaders, slug]);


    const fetchFloorDetails = useCallback(async (projectId, unitId) => {
        if (!projectId || !unitId) return null;
        try {
            const response = await axios.get(`${API_URL}/${projectId}/units/${unitId}/floor-details`, {
                params: {
                    slug,
                    subdomain: slug
                },
                headers: getAuthHeaders()
            });
            return response.data?.data?.[0] || response.data?.data || null;
        } catch (err) {
            console.error("Fetch floor details error:", err);
            return null;
        }
    }, [getAuthHeaders, slug]);

    return {
        isLoading,
        error,
        createProject,
        updateProject,
        createBlock,
        updateBlock,
        createUnit,
        createFloorDetails,
        fetchRevenuePlots,
        fetchFloorDetails
    };
};

export default useProjectAPI;
