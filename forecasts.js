'use strict';
// BEGIN GENERATED PUBLIC DTO V1
const PUBLIC_DTO_V1 = {"forecast":{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://omerahat.github.io/milletegitsekmi/data/v1/forecast.schema.json","type":"object","properties":{"schema_version":{"const":"1"},"generated_at":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},"forecast_origin":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},"observed_at":{"anyOf":[{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},{"type":"null"}]},"observed_occupancy":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"model_name":{"anyOf":[{"enum":["NaiveBaseline","LastObservationPersistence"]},{"type":"null"}]},"model_version":{"anyOf":[{"const":"baseline-v1"},{"type":"null"}]},"model_status":{"enum":["experimental","unavailable"]},"forecast_status":{"enum":["experimental_available","insufficient_data","stale","generation_failure"]},"method":{"enum":["NaiveBaseline","LastObservationPersistence"]},"readiness":{"type":"object","properties":{"ready":{"type":"boolean"},"reasons":{"type":"array","items":{"enum":["missing_observation","invalid_source_quality","invalid_observation","invalid_or_future_timestamp","stale_observation","missing_or_invalid_model_context","generation_failure"]}},"max_observation_age_minutes":{"const":15},"required_context":{"type":"string"},"quality_policy":{"const":"ml-data-v1-inferred5m-no-fill"}},"required":["ready","reasons","max_observation_age_minutes","required_context","quality_policy"],"additionalProperties":false},"freshness":{"type":"object","properties":{"max_age_minutes":{"const":15},"source_age_seconds":{"anyOf":[{"type":"number"},{"type":"null"}]}},"required":["max_age_minutes","source_age_seconds"],"additionalProperties":false},"horizon_hours":{"enum":[1,3,6,12,24]},"predictions":{"type":"array","items":{"type":"object","properties":{"target_timestamp":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},"interval_start":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},"predicted_occupancy":{"type":"number","minimum":0},"horizon_hour":{"type":"integer","minimum":1,"maximum":24}},"required":["target_timestamp","interval_start","predicted_occupancy","horizon_hour"],"additionalProperties":false},"maxItems":24},"evaluation_summary":{"anyOf":[{"type":"object","properties":{"overall":{"$ref":"#/$defs/metrics_v1"},"by_horizon":{"$ref":"#/$defs/horizons_v1"},"comparison_id":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9_.-]*$"},"protocol":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9_.-]*$"},"primary_window_count":{"type":"integer","minimum":1}},"required":["overall","by_horizon","comparison_id","protocol","primary_window_count"],"additionalProperties":false},{"type":"null"}]},"warnings":{"type":"array","items":{"type":"string"}},"input_bounds":{"anyOf":[{"type":"array","items":{"type":"number","minimum":0},"minItems":2,"maxItems":2},{"type":"null"}]},"target_semantics":{"const":"hourly interval end; complete future intervals only"},"selection":{"type":"object","properties":{"preferred_method":{"const":"NaiveBaseline"},"missing_reference_hours":{"type":"integer","minimum":0,"maximum":24},"fallback_reasons":{"type":"array","items":{"enum":["missing_observation","invalid_source_quality","invalid_observation","invalid_or_future_timestamp","stale_observation","missing_or_invalid_model_context","generation_failure"]}}},"required":["preferred_method","missing_reference_hours","fallback_reasons"],"additionalProperties":false},"forecast_id":{"type":"string","pattern":"^[0-9a-f]{64}$"},"windows":{"type":"object","properties":{"1":{"$ref":"#/$defs/window_forecast"},"3":{"$ref":"#/$defs/window_forecast"},"6":{"$ref":"#/$defs/window_forecast"},"12":{"$ref":"#/$defs/window_forecast"},"24":{"$ref":"#/$defs/window_forecast"}},"required":["1","3","6","12","24"],"additionalProperties":false}},"required":["schema_version","generated_at","forecast_origin","observed_at","observed_occupancy","model_name","model_version","model_status","forecast_status","method","readiness","freshness","horizon_hours","predictions","evaluation_summary","warnings","input_bounds","target_semantics"],"additionalProperties":false,"allOf":[{"if":{"properties":{"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"model_status":{"const":"experimental"},"model_name":{"enum":["NaiveBaseline","LastObservationPersistence"]},"model_version":{"const":"baseline-v1"},"observed_at":{"type":"string"},"observed_occupancy":{"type":"number"},"input_bounds":{"type":"array"},"readiness":{"properties":{"ready":{"const":true},"reasons":{"maxItems":0}}},"freshness":{"properties":{"source_age_seconds":{"type":"number","minimum":0,"maximum":900}}}}},"else":{"properties":{"model_name":{"type":"null"},"model_version":{"type":"null"},"input_bounds":{"type":"null"},"evaluation_summary":{"type":"null"},"predictions":{"maxItems":0},"model_status":{"const":"unavailable"},"readiness":{"properties":{"ready":{"const":false},"reasons":{"minItems":1}}}}}},{"if":{"properties":{"method":{"const":"NaiveBaseline"}}},"then":{"properties":{"model_name":{"enum":["NaiveBaseline",null]},"readiness":{"properties":{"required_context":{"const":"exact quality hours for requested seasonal targets"}}}}}},{"if":{"properties":{"method":{"const":"LastObservationPersistence"}}},"then":{"properties":{"model_name":{"enum":["LastObservationPersistence",null]},"readiness":{"properties":{"required_context":{"const":"fresh actual observation"}}}}}},{"if":{"properties":{"horizon_hours":{"const":1},"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"predictions":{"minItems":1,"maxItems":1}}}},{"if":{"properties":{"horizon_hours":{"const":6},"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"predictions":{"minItems":6,"maxItems":6}}}},{"if":{"properties":{"horizon_hours":{"const":12},"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"predictions":{"minItems":12,"maxItems":12}}}},{"if":{"properties":{"horizon_hours":{"const":24},"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"predictions":{"minItems":24,"maxItems":24}}}},{"if":{"properties":{"forecast_status":{"const":"stale"}}},"then":{"properties":{"freshness":{"properties":{"source_age_seconds":{"type":"number","exclusiveMinimum":900}}},"readiness":{"properties":{"reasons":{"contains":{"const":"stale_observation"}}}}}}},{"if":{"properties":{"forecast_status":{"const":"insufficient_data"}}},"then":{"properties":{"freshness":{"properties":{"source_age_seconds":{"anyOf":[{"type":"number","maximum":900},{"type":"null"}]}}}}}},{"if":{"properties":{"forecast_status":{"const":"generation_failure"}}},"then":{"properties":{"readiness":{"properties":{"reasons":{"contains":{"const":"generation_failure"}}}}}}},{"if":{"properties":{"readiness":{"properties":{"reasons":{"contains":{"const":"stale_observation"}}}}}},"then":{"properties":{"freshness":{"properties":{"source_age_seconds":{"type":"number","exclusiveMinimum":900}}}}}},{"if":{"properties":{"readiness":{"properties":{"reasons":{"contains":{"const":"generation_failure"}}}}}},"then":{"properties":{"forecast_status":{"const":"generation_failure"}}}},{"if":{"properties":{"horizon_hours":{"const":3},"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"predictions":{"minItems":3,"maxItems":3}}}}],"$defs":{"metrics_v1":{"type":"object","properties":{"mae":{"type":"number","minimum":0},"rmse":{"type":"number","minimum":0},"n":{"type":"integer","minimum":1},"r2":{"anyOf":[{"type":"number","maximum":1},{"type":"null"}]},"smape":{"type":"number","minimum":0,"maximum":200},"wape":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]}},"required":["mae","rmse","n"],"additionalProperties":false},"segment_metrics_v1":{"type":"object","properties":{"mae":{"type":"number","minimum":0},"rmse":{"type":"number","minimum":0},"n":{"type":"integer","minimum":1},"r2":{"anyOf":[{"type":"number","maximum":1},{"type":"null"}]},"smape":{"type":"number","minimum":0,"maximum":200},"wape":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"windows":{"type":"integer","minimum":1}},"required":["mae","rmse","n","windows"],"additionalProperties":false},"horizons_v1":{"type":"object","properties":{"1":{"$ref":"#/$defs/metrics_v1"},"2":{"$ref":"#/$defs/metrics_v1"},"3":{"$ref":"#/$defs/metrics_v1"},"4":{"$ref":"#/$defs/metrics_v1"},"5":{"$ref":"#/$defs/metrics_v1"},"6":{"$ref":"#/$defs/metrics_v1"},"7":{"$ref":"#/$defs/metrics_v1"},"8":{"$ref":"#/$defs/metrics_v1"},"9":{"$ref":"#/$defs/metrics_v1"},"10":{"$ref":"#/$defs/metrics_v1"},"11":{"$ref":"#/$defs/metrics_v1"},"12":{"$ref":"#/$defs/metrics_v1"},"13":{"$ref":"#/$defs/metrics_v1"},"14":{"$ref":"#/$defs/metrics_v1"},"15":{"$ref":"#/$defs/metrics_v1"},"16":{"$ref":"#/$defs/metrics_v1"},"17":{"$ref":"#/$defs/metrics_v1"},"18":{"$ref":"#/$defs/metrics_v1"},"19":{"$ref":"#/$defs/metrics_v1"},"20":{"$ref":"#/$defs/metrics_v1"},"21":{"$ref":"#/$defs/metrics_v1"},"22":{"$ref":"#/$defs/metrics_v1"},"23":{"$ref":"#/$defs/metrics_v1"},"24":{"$ref":"#/$defs/metrics_v1"}},"additionalProperties":false},"window_forecast":{"type":"object","properties":{"schema_version":{"const":"1"},"generated_at":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},"forecast_origin":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},"observed_at":{"anyOf":[{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},{"type":"null"}]},"observed_occupancy":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"model_name":{"anyOf":[{"enum":["NaiveBaseline","LastObservationPersistence"]},{"type":"null"}]},"model_version":{"anyOf":[{"const":"baseline-v1"},{"type":"null"}]},"model_status":{"enum":["experimental","unavailable"]},"forecast_status":{"enum":["experimental_available","insufficient_data","stale","generation_failure"]},"method":{"enum":["NaiveBaseline","LastObservationPersistence"]},"readiness":{"type":"object","properties":{"ready":{"type":"boolean"},"reasons":{"type":"array","items":{"enum":["missing_observation","invalid_source_quality","invalid_observation","invalid_or_future_timestamp","stale_observation","missing_or_invalid_model_context","generation_failure"]}},"max_observation_age_minutes":{"const":15},"required_context":{"type":"string"},"quality_policy":{"const":"ml-data-v1-inferred5m-no-fill"}},"required":["ready","reasons","max_observation_age_minutes","required_context","quality_policy"],"additionalProperties":false},"freshness":{"type":"object","properties":{"max_age_minutes":{"const":15},"source_age_seconds":{"anyOf":[{"type":"number"},{"type":"null"}]}},"required":["max_age_minutes","source_age_seconds"],"additionalProperties":false},"horizon_hours":{"enum":[1,3,6,12,24]},"predictions":{"type":"array","items":{"type":"object","properties":{"target_timestamp":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},"interval_start":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},"predicted_occupancy":{"type":"number","minimum":0},"horizon_hour":{"type":"integer","minimum":1,"maximum":24}},"required":["target_timestamp","interval_start","predicted_occupancy","horizon_hour"],"additionalProperties":false},"maxItems":24},"evaluation_summary":{"anyOf":[{"type":"object","properties":{"overall":{"$ref":"#/$defs/metrics_v1"},"by_horizon":{"$ref":"#/$defs/horizons_v1"},"comparison_id":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9_.-]*$"},"protocol":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9_.-]*$"},"primary_window_count":{"type":"integer","minimum":1}},"required":["overall","by_horizon","comparison_id","protocol","primary_window_count"],"additionalProperties":false},{"type":"null"}]},"warnings":{"type":"array","items":{"type":"string"}},"input_bounds":{"anyOf":[{"type":"array","items":{"type":"number","minimum":0},"minItems":2,"maxItems":2},{"type":"null"}]},"target_semantics":{"const":"hourly interval end; complete future intervals only"},"selection":{"type":"object","properties":{"preferred_method":{"const":"NaiveBaseline"},"missing_reference_hours":{"type":"integer","minimum":0,"maximum":24},"fallback_reasons":{"type":"array","items":{"enum":["missing_observation","invalid_source_quality","invalid_observation","invalid_or_future_timestamp","stale_observation","missing_or_invalid_model_context","generation_failure"]}}},"required":["preferred_method","missing_reference_hours","fallback_reasons"],"additionalProperties":false}},"required":["schema_version","generated_at","forecast_origin","observed_at","observed_occupancy","model_name","model_version","model_status","forecast_status","method","readiness","freshness","horizon_hours","predictions","evaluation_summary","warnings","input_bounds","target_semantics"],"additionalProperties":false,"allOf":[{"if":{"properties":{"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"model_status":{"const":"experimental"},"model_name":{"enum":["NaiveBaseline","LastObservationPersistence"]},"model_version":{"const":"baseline-v1"},"observed_at":{"type":"string"},"observed_occupancy":{"type":"number"},"input_bounds":{"type":"array"},"readiness":{"properties":{"ready":{"const":true},"reasons":{"maxItems":0}}},"freshness":{"properties":{"source_age_seconds":{"type":"number","minimum":0,"maximum":900}}}}},"else":{"properties":{"model_name":{"type":"null"},"model_version":{"type":"null"},"input_bounds":{"type":"null"},"evaluation_summary":{"type":"null"},"predictions":{"maxItems":0},"model_status":{"const":"unavailable"},"readiness":{"properties":{"ready":{"const":false},"reasons":{"minItems":1}}}}}},{"if":{"properties":{"method":{"const":"NaiveBaseline"}}},"then":{"properties":{"model_name":{"enum":["NaiveBaseline",null]},"readiness":{"properties":{"required_context":{"const":"exact quality hours for requested seasonal targets"}}}}}},{"if":{"properties":{"method":{"const":"LastObservationPersistence"}}},"then":{"properties":{"model_name":{"enum":["LastObservationPersistence",null]},"readiness":{"properties":{"required_context":{"const":"fresh actual observation"}}}}}},{"if":{"properties":{"horizon_hours":{"const":1},"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"predictions":{"minItems":1,"maxItems":1}}}},{"if":{"properties":{"horizon_hours":{"const":6},"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"predictions":{"minItems":6,"maxItems":6}}}},{"if":{"properties":{"horizon_hours":{"const":12},"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"predictions":{"minItems":12,"maxItems":12}}}},{"if":{"properties":{"horizon_hours":{"const":24},"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"predictions":{"minItems":24,"maxItems":24}}}},{"if":{"properties":{"forecast_status":{"const":"stale"}}},"then":{"properties":{"freshness":{"properties":{"source_age_seconds":{"type":"number","exclusiveMinimum":900}}},"readiness":{"properties":{"reasons":{"contains":{"const":"stale_observation"}}}}}}},{"if":{"properties":{"forecast_status":{"const":"insufficient_data"}}},"then":{"properties":{"freshness":{"properties":{"source_age_seconds":{"anyOf":[{"type":"number","maximum":900},{"type":"null"}]}}}}}},{"if":{"properties":{"forecast_status":{"const":"generation_failure"}}},"then":{"properties":{"readiness":{"properties":{"reasons":{"contains":{"const":"generation_failure"}}}}}}},{"if":{"properties":{"readiness":{"properties":{"reasons":{"contains":{"const":"stale_observation"}}}}}},"then":{"properties":{"freshness":{"properties":{"source_age_seconds":{"type":"number","exclusiveMinimum":900}}}}}},{"if":{"properties":{"readiness":{"properties":{"reasons":{"contains":{"const":"generation_failure"}}}}}},"then":{"properties":{"forecast_status":{"const":"generation_failure"}}}},{"if":{"properties":{"horizon_hours":{"const":3},"forecast_status":{"const":"experimental_available"}}},"then":{"properties":{"predictions":{"minItems":3,"maxItems":3}}}}]}}},"model-arena":{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://omerahat.github.io/milletegitsekmi/data/v1/model-arena.schema.json","type":"object","properties":{"schema_version":{"const":"1"},"generated_at":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},"comparison_id":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9_.-]*$"},"protocol":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9_.-]*$"},"current_forecast_model":{"enum":["NaiveBaseline","LastObservationPersistence",null]},"primary_window_count":{"type":"integer","minimum":0},"evaluation_origins":{"type":"array","items":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"}},"models":{"type":"array","items":{"type":"object","properties":{"model_name":{"enum":["NaiveBaseline","LightGBM","GradientBoosting","XGBoost","RandomForest","CatBoost","Prophet","EBM"]},"evaluation_status":{"enum":["evaluated","unavailable","failed","excluded"]},"overall":{"anyOf":[{"$ref":"#/$defs/metrics_v1"},{"type":"null"}]},"by_horizon":{"$ref":"#/$defs/horizons_v1"},"evaluation_windows":{"type":"integer","minimum":0},"baseline_improvement_pct":{"anyOf":[{"type":"number"},{"type":"null"}]},"initial_quality_gate":{"type":"boolean"},"fitted_artifact_status":{"enum":["verified_offline","unavailable"]},"fitted_artifact_version":{"anyOf":[{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9_.-]*$"},{"type":"null"}]},"approved_for_live_inference":{"type":"boolean"},"model_status":{"enum":["experimental","rejected"]}},"required":["model_name","evaluation_status","overall","by_horizon","evaluation_windows","baseline_improvement_pct","initial_quality_gate","fitted_artifact_status","fitted_artifact_version","approved_for_live_inference","model_status"],"additionalProperties":false,"allOf":[{"if":{"properties":{"evaluation_status":{"const":"evaluated"}}},"then":{"properties":{"overall":{"type":"object"},"evaluation_windows":{"minimum":1}}},"else":{"properties":{"overall":{"type":"null"},"by_horizon":{"maxProperties":0},"evaluation_windows":{"const":0},"baseline_improvement_pct":{"type":"null"},"initial_quality_gate":{"const":false}}}},{"if":{"properties":{"fitted_artifact_status":{"const":"verified_offline"}}},"then":{"properties":{"fitted_artifact_version":{"type":"string","minLength":1}}},"else":{"properties":{"fitted_artifact_version":{"type":"null"}}}},{"if":{"properties":{"model_name":{"const":"NaiveBaseline"}}},"then":{},"else":{"properties":{"approved_for_live_inference":{"const":false}}}}]}},"baseline_comparison":{"anyOf":[{"type":"null"},{"type":"object","properties":{"comparison_id":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9_.-]*$"},"protocol":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9_.-]*$"},"primary_window_count":{"type":"integer","minimum":1},"models":{"type":"object","properties":{"NaiveBaseline":{"type":"object","properties":{"status":{"const":"evaluated"},"windows":{"type":"integer","minimum":1},"overall":{"$ref":"#/$defs/metrics_v1"},"by_horizon":{"$ref":"#/$defs/horizons_v1"},"by_segment":{"type":"object","patternProperties":{"^[0-9]{13}$":{"$ref":"#/$defs/segment_metrics_v1"}},"additionalProperties":false}},"required":["status","windows","overall","by_horizon","by_segment"],"additionalProperties":false},"LastObservationPersistence":{"type":"object","properties":{"status":{"const":"evaluated"},"windows":{"type":"integer","minimum":1},"overall":{"$ref":"#/$defs/metrics_v1"},"by_horizon":{"$ref":"#/$defs/horizons_v1"},"by_segment":{"type":"object","patternProperties":{"^[0-9]{13}$":{"$ref":"#/$defs/segment_metrics_v1"}},"additionalProperties":false}},"required":["status","windows","overall","by_horizon","by_segment"],"additionalProperties":false},"PreviousWeek":{"type":"object","properties":{"status":{"const":"evaluated"},"windows":{"type":"integer","minimum":1},"overall":{"$ref":"#/$defs/metrics_v1"},"by_horizon":{"$ref":"#/$defs/horizons_v1"},"by_segment":{"type":"object","patternProperties":{"^[0-9]{13}$":{"$ref":"#/$defs/segment_metrics_v1"}},"additionalProperties":false}},"required":["status","windows","overall","by_horizon","by_segment"],"additionalProperties":false},"HourOfWeekMean":{"type":"object","properties":{"status":{"const":"evaluated"},"windows":{"type":"integer","minimum":1},"overall":{"$ref":"#/$defs/metrics_v1"},"by_horizon":{"$ref":"#/$defs/horizons_v1"},"by_segment":{"type":"object","patternProperties":{"^[0-9]{13}$":{"$ref":"#/$defs/segment_metrics_v1"}},"additionalProperties":false}},"required":["status","windows","overall","by_horizon","by_segment"],"additionalProperties":false}},"additionalProperties":false},"limitations":{"type":"array","items":{"type":"string"}}},"required":["comparison_id","protocol","primary_window_count","models","limitations"],"additionalProperties":false}]},"warnings":{"type":"array","items":{"type":"string"}},"evaluation_recorded_at":{"type":"string","format":"date-time","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$"},"evaluation_date_basis":{"const":"saved evaluation file modification time; execution time not recorded"},"online_evaluation":{"type":"object","properties":{"protocol":{"const":"issued-before-interval-v1"},"by_window":{"type":"array","items":{"type":"object","properties":{"model":{"enum":["NaiveBaseline","LastObservationPersistence"]},"version":{"const":"baseline-v1"},"window_hours":{"enum":[1,3,6,12,24]},"n":{"type":"integer","minimum":0},"due":{"type":"integer","minimum":1},"coverage":{"type":"number","minimum":0,"maximum":1},"mae":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"rmse":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"baseline_mae":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"baseline_rmse":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]}},"required":["model","version","window_hours","n","due","coverage","mae","rmse","baseline_mae","baseline_rmse"],"additionalProperties":false},"maxItems":10},"by_lead":{"type":"array","items":{"type":"object","properties":{"model":{"enum":["NaiveBaseline","LastObservationPersistence"]},"version":{"const":"baseline-v1"},"window_hours":{"enum":[1,3,6,12,24]},"n":{"type":"integer","minimum":0},"due":{"type":"integer","minimum":1},"coverage":{"type":"number","minimum":0,"maximum":1},"mae":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"rmse":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"baseline_mae":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"baseline_rmse":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"lead_hour":{"type":"integer","minimum":1,"maximum":24}},"required":["model","version","window_hours","n","due","coverage","mae","rmse","baseline_mae","baseline_rmse","lead_hour"],"additionalProperties":false},"maxItems":92}},"required":["protocol","by_window","by_lead"],"additionalProperties":false}},"required":["schema_version","generated_at","comparison_id","protocol","current_forecast_model","primary_window_count","evaluation_origins","models","baseline_comparison","warnings"],"additionalProperties":false,"$defs":{"metrics_v1":{"type":"object","properties":{"mae":{"type":"number","minimum":0},"rmse":{"type":"number","minimum":0},"n":{"type":"integer","minimum":1},"r2":{"anyOf":[{"type":"number","maximum":1},{"type":"null"}]},"smape":{"type":"number","minimum":0,"maximum":200},"wape":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]}},"required":["mae","rmse","n"],"additionalProperties":false},"segment_metrics_v1":{"type":"object","properties":{"mae":{"type":"number","minimum":0},"rmse":{"type":"number","minimum":0},"n":{"type":"integer","minimum":1},"r2":{"anyOf":[{"type":"number","maximum":1},{"type":"null"}]},"smape":{"type":"number","minimum":0,"maximum":200},"wape":{"anyOf":[{"type":"number","minimum":0},{"type":"null"}]},"windows":{"type":"integer","minimum":1}},"required":["mae","rmse","n","windows"],"additionalProperties":false},"horizons_v1":{"type":"object","properties":{"1":{"$ref":"#/$defs/metrics_v1"},"2":{"$ref":"#/$defs/metrics_v1"},"3":{"$ref":"#/$defs/metrics_v1"},"4":{"$ref":"#/$defs/metrics_v1"},"5":{"$ref":"#/$defs/metrics_v1"},"6":{"$ref":"#/$defs/metrics_v1"},"7":{"$ref":"#/$defs/metrics_v1"},"8":{"$ref":"#/$defs/metrics_v1"},"9":{"$ref":"#/$defs/metrics_v1"},"10":{"$ref":"#/$defs/metrics_v1"},"11":{"$ref":"#/$defs/metrics_v1"},"12":{"$ref":"#/$defs/metrics_v1"},"13":{"$ref":"#/$defs/metrics_v1"},"14":{"$ref":"#/$defs/metrics_v1"},"15":{"$ref":"#/$defs/metrics_v1"},"16":{"$ref":"#/$defs/metrics_v1"},"17":{"$ref":"#/$defs/metrics_v1"},"18":{"$ref":"#/$defs/metrics_v1"},"19":{"$ref":"#/$defs/metrics_v1"},"20":{"$ref":"#/$defs/metrics_v1"},"21":{"$ref":"#/$defs/metrics_v1"},"22":{"$ref":"#/$defs/metrics_v1"},"23":{"$ref":"#/$defs/metrics_v1"},"24":{"$ref":"#/$defs/metrics_v1"}},"additionalProperties":false}}}};
// END GENERATED PUBLIC DTO V1
const forecastElement = id => document.getElementById(id);
const FORECAST_HOUR_MS = 3600000;
const MAX_PUBLIC_JSON_BYTES = 1048576;
const METHOD_LABELS = {
  NaiveBaseline: 'Önceki günün gerçek saatlik ölçümlerinden dondurulmuş 24 saatlik döngü; son adım gerekirse önceki tahmini tekrarlar.',
  LastObservationPersistence: 'Sabit gözlem: son gerçek ölçümü tüm saatler için tekrarlar.'
};
const localForecastTime = value => new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
function publicTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 19) !== value.slice(0, 19)) throw new Error('Geçersiz zaman');
  return Date.parse(value);
}
function positiveNumber(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0; }
// This evaluator covers the keywords used by our generated v1 DTOs. Application
// checks below additionally enforce cross-field time, identity and state rules.
function matchesPublicDto(value, schema, root) {
  if (schema.$ref) return matchesPublicDto(value, root.$defs[schema.$ref.split('/').pop()], root);
  if (schema.anyOf && !schema.anyOf.some(s => matchesPublicDto(value, s, root))) return false;
  if (schema.allOf && !schema.allOf.every(s => matchesPublicDto(value, s, root))) return false;
  if (schema.if && !matchesPublicDto(value, matchesPublicDto(value, schema.if, root) ? schema.then || {} : schema.else || {}, root)) return false;
  if (Object.hasOwn(schema, 'const') && value !== schema.const) return false;
  if (schema.enum && !schema.enum.includes(value)) return false;
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  if (schema.type && (schema.type === 'integer' ? !Number.isInteger(value) : schema.type !== type)) return false;
  if (type === 'number') {
    if (!Number.isFinite(value) || (schema.minimum !== undefined && value < schema.minimum) || (schema.maximum !== undefined && value > schema.maximum) || (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum)) return false;
  }
  if (type === 'string') {
    if ((schema.minLength !== undefined && value.length < schema.minLength) || (schema.maxLength !== undefined && value.length > schema.maxLength)) return false;
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) return false;
    if (schema.format === 'date-time') { try { publicTimestamp(value); } catch { return false; } }
  }
  if (type === 'array') {
    if ((schema.minItems !== undefined && value.length < schema.minItems) || (schema.maxItems !== undefined && value.length > schema.maxItems)) return false;
    if (schema.items && !value.every(v => matchesPublicDto(v, schema.items, root))) return false;
    if (schema.contains && !value.some(v => matchesPublicDto(v, schema.contains, root))) return false;
  }
  if (type === 'object') {
    if ((schema.required || []).some(k => !Object.hasOwn(value, k)) || (schema.maxProperties !== undefined && Object.keys(value).length > schema.maxProperties)) return false;
    for (const [key, child] of Object.entries(value)) {
      const property = schema.properties && Object.hasOwn(schema.properties, key) ? schema.properties[key] : null;
      const patterns = Object.entries(schema.patternProperties || {}).filter(([p]) => new RegExp(p).test(key));
      if (property && !matchesPublicDto(child, property, root)) return false;
      if (!patterns.every(([, s]) => matchesPublicDto(child, s, root))) return false;
      if (!property && !patterns.length && schema.additionalProperties === false) return false;
    }
  }
  return true;
}
function validatePublicDto(name, value) {
  const schema = PUBLIC_DTO_V1[name];
  if (!matchesPublicDto(value, schema, schema)) throw new Error('Invalid public DTO v1');
}
function parseStrictJson(source) {
  let position = 0;
  let nodes = 0;
  const fail = () => { throw new Error('Invalid public JSON'); };
  const whitespace = () => { while (source[position] === ' ' || source[position] === '\n' || source[position] === '\r' || source[position] === '\t') position++; };
  const string = () => {
    const start = position++;
    while (position < source.length) {
      const code = source.charCodeAt(position++);
      if (code === 34) return JSON.parse(source.slice(start, position));
      if (code < 32) fail();
      if (code === 92) position++;
    }
    return fail();
  };
  const value = depth => {
    if (++nodes > 100000 || depth > 64) fail();
    whitespace();
    const token = source[position];
    if (token === '"') return string();
    if (token === '{') {
      position++;
      const result = {};
      const keys = new Set();
      whitespace();
      if (source[position] === '}') { position++; return result; }
      while (position < source.length) {
        whitespace();
        if (source[position] !== '"') fail();
        const key = string();
        if (keys.has(key)) fail();
        keys.add(key);
        whitespace();
        if (source[position++] !== ':') fail();
        Object.defineProperty(result, key, { value: value(depth + 1), enumerable: true, writable: true, configurable: true });
        whitespace();
        const separator = source[position++];
        if (separator === '}') return result;
        if (separator !== ',') fail();
      }
      return fail();
    }
    if (token === '[') {
      position++;
      const result = [];
      whitespace();
      if (source[position] === ']') { position++; return result; }
      while (position < source.length) {
        result.push(value(depth + 1));
        whitespace();
        const separator = source[position++];
        if (separator === ']') return result;
        if (separator !== ',') fail();
      }
      return fail();
    }
    for (const [literal, parsed] of [['true', true], ['false', false], ['null', null]]) {
      if (source.startsWith(literal, position)) { position += literal.length; return parsed; }
    }
    const number = source.slice(position).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (number) {
      position += number[0].length;
      const parsed = Number(number[0]);
      if (!Number.isFinite(parsed)) fail();
      return parsed;
    }
    return fail();
  };
  const parsed = value(0);
  whitespace();
  if (position !== source.length) fail();
  return parsed;
}
async function readPublicJson(response) {
  const length = Number(response.headers.get('content-length'));
  if (Number.isFinite(length) && length > MAX_PUBLIC_JSON_BYTES) throw new Error('Public JSON too large');
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_PUBLIC_JSON_BYTES) { await reader.cancel(); throw new Error('Public JSON too large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return parseStrictJson(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}
function validatePublicForecast(data) {
  validatePublicDto('forecast', data);
  if (data.windows) {
    for (const [h, window] of Object.entries(data.windows)) {
      if (window.windows || window.horizon_hours !== Number(h) || window.forecast_origin !== data.forecast_origin || window.generated_at !== data.generated_at) throw new Error('Inconsistent horizon');
      validatePublicForecast(window);
    }
    const compatibility = { ...data };
    delete compatibility.windows;
    delete compatibility.forecast_id;
    if (JSON.stringify(compatibility) !== JSON.stringify(data.windows['24'])) throw new Error('Inconsistent trajectory');
  }
  if (!data || data.schema_version !== '1' || !['experimental_available', 'insufficient_data', 'stale', 'generation_failure'].includes(data.forecast_status) || !Array.isArray(data.predictions) || !Array.isArray(data.warnings) || data.warnings.some(w => typeof w !== 'string')) throw new Error('Geçersiz tahmin');
  const origin = publicTimestamp(data.forecast_origin);
  if (publicTimestamp(data.generated_at) < origin || origin > Date.now() + 120000) throw new Error('Geçersiz başlangıç');
  if (data.observed_at !== null) publicTimestamp(data.observed_at);
  const age = data.observed_at === null ? null : (origin - publicTimestamp(data.observed_at)) / 1000;
  if (data.freshness.source_age_seconds !== age) throw new Error('Inconsistent source age');
  if (data.forecast_status === 'stale' && (age === null || age <= 900 || !data.readiness.reasons.includes('stale_observation'))) throw new Error('Inconsistent stale state');
  if (data.forecast_status === 'insufficient_data' && age !== null && age > 900) throw new Error('Stale input');
  if (data.forecast_status !== 'experimental_available') {
    if (data.predictions.length) throw new Error('Kullanılamayan tahmin');
    return data;
  }
  if (!Object.hasOwn(METHOD_LABELS, data.model_name) || data.method !== data.model_name || !data.readiness.ready || data.readiness.reasons.length || data.model_status !== 'experimental' || data.predictions.length !== data.horizon_hours || !positiveNumber(data.observed_occupancy) || data.observed_at === null || age < 0 || age > 900) throw new Error('Geçersiz model');
  if (data.input_bounds[0] > data.input_bounds[1]) throw new Error('Invalid bounds');
  if (data.method === 'LastObservationPersistence' && data.input_bounds.some(v => v !== data.observed_occupancy)) throw new Error('Invalid persistence bounds');
  data.predictions.forEach((p, i) => {
    const target = Math.ceil(origin / FORECAST_HOUR_MS) * FORECAST_HOUR_MS + (i + 1) * FORECAST_HOUR_MS;
    if (p.horizon_hour !== i + 1 || publicTimestamp(p.target_timestamp) !== target || publicTimestamp(p.interval_start) !== target - FORECAST_HOUR_MS || !positiveNumber(p.predicted_occupancy) || p.predicted_occupancy < data.input_bounds[0] || p.predicted_occupancy > data.input_bounds[1]) throw new Error('Geçersiz tahmin noktası');
  });
  return data;
}
function validatePublicArena(data) {
  validatePublicDto('model-arena', data);
  if (!data || data.schema_version !== '1' || !Array.isArray(data.models) || !Array.isArray(data.warnings) || data.warnings.some(w => typeof w !== 'string') || !Number.isInteger(data.primary_window_count) || data.primary_window_count < 0 || typeof data.comparison_id !== 'string' || typeof data.protocol !== 'string') throw new Error('Geçersiz değerlendirme');
  publicTimestamp(data.generated_at);
  const names = new Set();
  for (const entry of data.models) {
    if (typeof entry.model_name !== 'string' || names.has(entry.model_name) || !Number.isInteger(entry.evaluation_windows) || entry.evaluation_windows < 0 || (entry.model_name !== 'NaiveBaseline' && entry.approved_for_live_inference)) throw new Error('Geçersiz model');
    names.add(entry.model_name);
    if (entry.evaluation_status === 'evaluated') {
      for (const m of [entry.overall, ...Object.values(entry.by_horizon)]) {
        if (!m || !positiveNumber(m.mae) || !positiveNumber(m.rmse) || !Number.isInteger(m.n) || m.n < 1) throw new Error('Geçersiz skor');
      }
      if (entry.baseline_improvement_pct !== null && entry.baseline_improvement_pct !== undefined && !Number.isFinite(entry.baseline_improvement_pct)) throw new Error('Geçersiz karşılaştırma');
    } else if (entry.overall !== null) throw new Error('Kaydedilmemiş skor');
  }
  return data;
}
function textNode(tag, text) { const node = document.createElement(tag); node.textContent = text; return node; }
function renderPublicWarnings(id, warnings) {
  const labels = {
    'Flat persistence assumption: last observed count held constant; no day/night changes.': 'Son gerçek ölçüm sabit tutulur; gün/gece değişimi modellenmez.',
    'No recorded evaluation for this persistence recipe; seasonal NaiveBaseline scores do not apply.': 'Bu sabit gözlem yöntemi için henüz kayıtlı değerlendirme yok; mevsimsel yöntemin skorları buna uygulanmaz.',
    'Forecast generation failed; no new predictions.': 'Bu pencere için yeni tahmin üretilemedi.',
    missing_or_invalid_model_context: 'Gerekli kesintisiz ve geçerli saatlik ölçüm geçmişi henüz yok.',
    stale_observation: 'Kaynak ölçüm güncel değil.',
    missing_observation: 'Kaynak ölçüm bulunamadı.',
    invalid_source_quality: 'Kaynak ölçüm kalite kontrolünü geçemedi.',
    invalid_observation: 'Kaynak doluluk değeri geçersiz.',
    invalid_or_future_timestamp: 'Kaynak ölçüm zamanı doğrulanamadı.',
    generation_failure: 'Yeni tahmin üretilemedi.',
    'Experimental baseline; not validated ML performance. No calibrated uncertainty intervals.': 'Deneysel referans yöntemi; tahmin güvenilirliği doğrulanmamıştır. Kalibre edilmiş güven aralığı yoktur.',
    'Historical evaluation has limited coverage and does not certify current accuracy.': 'Geçmiş değerlendirme sınırlı kapsamlıdır; güncel tahmin doğruluğunu kanıtlamaz.',
    'Historical availability is reconstructed; imported ingestion times are unknown.': 'Geçmiş verinin erişilebilirliği yeniden oluşturulmuştur; aktarılan kayıtların özgün alınma zamanları bilinmiyor.',
    'Evaluation windows may be correlated; no independent post-selection or production validation.': 'Test dönemleri ilişkili olabilir; model seçiminden sonra bağımsız test ve üretim doğrulaması yapılmamıştır.',
    'Seasonal comparisons do not establish live readiness.': 'Mevsimsel karşılaştırma, modelin bugün kullanıma hazır olduğunu göstermez.',
    'Offline ranking is separate from live readiness; no validated production model.': 'Bu sıralama çevrimdışı testlere aittir. Onaylanmış üretim modeli yoktur.',
    'Endpoint horizon metrics use one target per origin; overall metrics pool all 24 targets.': 'Ufuk skorları her başlangıçtan bir hedefi; toplam skor 24 hedefin tamamını kullanır. Kayıtlı test protokolü ilk başlamış saati de kapsar; yeni tam gelecek aralıklarının ayrıca ölçülmüş doğruluğu değildir.'
  };
  forecastElement(id).replaceChildren(...warnings.map(w => textNode('li', labels[w] || w)));
}
let selectedForecastHorizon = 6;
function renderForecast(data) {
  if (data.windows) data = data.windows[String(selectedForecastHorizon)];
  else if (data.horizon_hours >= selectedForecastHorizon && data.forecast_status === 'experimental_available') data = { ...data, horizon_hours: selectedForecastHorizon, predictions: data.predictions.slice(0, selectedForecastHorizon) };
  const stale = Date.now() - publicTimestamp(data.forecast_origin) > 30 * 60000 || (data.observed_at && Date.now() - publicTimestamp(data.observed_at) > data.freshness.max_age_minutes * 60000) || data.predictions.some(p => publicTimestamp(p.interval_start) < Date.now());
  const available = data.forecast_status === 'experimental_available';
  forecastElement('forecast-output').hidden = !available;
  forecastElement('forecast-status').textContent = stale || data.forecast_status === 'stale' ? 'Tahmin eski; güncel tahmin bekleniyor.' : available ? `${data.horizon_hours} saatlik deneysel tahmin · İstanbul saatleri` : 'Bu pencere için veri eksik veya geçersiz; tahmin kullanılamıyor.';
  forecastElement('forecast-method').textContent = data.model_name ? `${data.model_name} · ${METHOD_LABELS[data.model_name] || ''}` : 'Uygun yöntem bulunamadı.';
  forecastElement('forecast-times').textContent = `Üretim: ${localForecastTime(data.generated_at)} · Sürüm: ${data.model_version || 'yok'} · Son ölçüm: ${data.observed_at ? localForecastTime(data.observed_at) : 'yok'} · Veri yaşı: ${data.freshness.source_age_seconds === null ? 'bilinmiyor' : Math.max(0, Math.round((Date.now() - publicTimestamp(data.observed_at)) / 60000)) + ' dk'} (İstanbul)`;
  const selection = forecastElement('forecast-fallback');
  if (selection) selection.textContent = data.selection?.fallback_reasons.length ? `Mevsimsel yöntem uygun değil (${data.selection.missing_reference_hours} eksik/geçersiz referans saati). ${available ? 'Son geçerli gözlem kullanılıyor; gün/gece değişimi modellenmez.' : 'Son gözlem de kalite ve güncellik koşullarını sağlamıyor.'}` : data.method === 'NaiveBaseline' ? 'Önceki günün bu saatlerine ait kalite kontrolünden geçmiş gerçek ölçümler kullanılıyor.' : 'Son gerçek gözlem sabit tutulur; gün/gece değişimi modellenmez.';
  const headline = forecastElement('forecast-headline');
  if (headline) {
    headline.hidden = !available || data.horizon_hours !== 1;
    headline.textContent = available ? `${Math.round(data.predictions[0].predicted_occupancy).toLocaleString('tr-TR')} kişi · Son ölçüm ${data.observed_occupancy.toLocaleString('tr-TR')} · Fark ${(data.predictions[0].predicted_occupancy - data.observed_occupancy).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}` : '';
  }
  const reference = forecastElement('forecast-reference');
  if (reference) reference.textContent = data.observed_occupancy === null ? 'Son ölçüm yok.' : `Kesikli çizgi: son ölçüm ${data.observed_occupancy.toLocaleString('tr-TR')} kişi. Her değer bir saatlik aralığı gösterir; çok saatlik ortalama değildir.`;
  renderPublicWarnings('forecast-warnings', data.warnings);
  if (!available) return;
  forecastElement('forecast-rows').replaceChildren(...data.predictions.map(p => {
    const row = document.createElement('tr');
    row.append(textNode('td', `${p.horizon_hour} saat`), textNode('td', `${localForecastTime(p.interval_start)} – ${localForecastTime(p.target_timestamp)}`), textNode('td', p.predicted_occupancy.toLocaleString('tr-TR', { maximumFractionDigits: 1 })));
    return row;
  }));
  const svg = forecastElement('forecast-chart');
  for (const node of svg.querySelectorAll('.forecast-mark')) node.remove();
  const maximum = Math.max(1, data.observed_occupancy || 0, ...data.predictions.map(p => p.predicted_occupancy));
  const mark = (tag, attributes, text) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    node.setAttribute('class', 'forecast-mark');
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    svg.append(node);
  };
  const x = i => 60 + i * 621 / Math.max(1, data.predictions.length - 1);
  mark('polyline', { points: data.predictions.map((p, i) => `${x(i)},${195 - p.predicted_occupancy / maximum * 165}`).join(' ') });
  if (data.observed_occupancy !== null) mark('line', { x1: 60, x2: 681, y1: 195 - data.observed_occupancy / maximum * 165, y2: 195 - data.observed_occupancy / maximum * 165, 'stroke-dasharray': '6 5', stroke: '#728396' });
  data.predictions.forEach((p, i) => mark('circle', { cx: x(i), cy: 195 - p.predicted_occupancy / maximum * 165, r: 3, fill: 'currentColor' }));
  mark('text', { x: 5, y: 30 }, Math.ceil(maximum).toLocaleString('tr-TR'));
  mark('text', { x: 5, y: 195 }, '0 kişi');
  const ticks = new Set([0, .25, .5, .75, 1].map(f => Math.round(f * (data.predictions.length - 1))));
  for (const i of ticks) mark('text', { x: x(i), y: 225, 'text-anchor': 'middle' }, new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' }).format(new Date(data.predictions[i].target_timestamp)));
}
let arenaData = null;
function renderArena(data) {
  const horizon = forecastElement('arena-horizon').value || 'overall';
  forecastElement('arena-output').hidden = false;
  forecastElement('arena-status').textContent = `${data.primary_window_count} geçmiş tahmin başlangıcı · Deneysel, üretim onayı yok.`;
  forecastElement('arena-provenance').textContent = `Karşılaştırma: ${data.comparison_id} · Protokol: ${data.protocol} · Değerlendirme kaydı: ${data.evaluation_recorded_at ? localForecastTime(data.evaluation_recorded_at) : 'tarih kaydedilmemiş'} · Yayın: ${localForecastTime(data.generated_at)} (İstanbul). Ufuk skorları tek hedefi, toplam skor tüm saatleri kapsar.`;
  const metric = m => m === undefined || m === null ? '—' : m.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  const baseline = data.models.find(e => e.model_name === 'NaiveBaseline');
  const baselineScore = baseline && (horizon === 'overall' ? baseline.overall : baseline.by_horizon[horizon]);
  forecastElement('arena-rows').replaceChildren(...data.models.map(entry => {
    const score = entry.evaluation_status === 'evaluated' ? (horizon === 'overall' ? entry.overall : entry.by_horizon[horizon]) : null;
    const improvement = score && baselineScore && baselineScore.mae > 0 ? `${metric((baselineScore.mae - score.mae) / baselineScore.mae * 100)}%` : '—';
    const row = document.createElement('tr');
    row.append(...[`${entry.model_name} · ${entry.fitted_artifact_version || 'kayıtlı sürüm yok'}`, metric(score?.mae), metric(score?.rmse), score ? `${score.n} hedef / ${entry.evaluation_windows} başlangıç` : 'Değerlendirilmedi', improvement, entry.model_status === 'rejected' ? 'Reddedildi: kalite eşiği geçilmedi' : entry.approved_for_live_inference ? 'Deneysel; veri hazırlığı gerekli' : entry.evaluation_status === 'excluded' ? 'Değerlendirilmedi' : 'Deneysel; terfi edilmedi'].map(value => textNode('td', value)));
    return row;
  }));
  const eligible = data.models.filter(e => e.evaluation_status === 'evaluated' && e.initial_quality_gate && e.model_name !== 'NaiveBaseline').sort((a, b) => a.overall.mae - b.overall.mae || a.model_name.localeCompare(b.model_name));
  forecastElement('arena-selection').textContent = `Seçim: aynı karşılaştırmada toplam MAE artan sırada, eşitlikte model adı. Kalite eşiğini geçen en iyi aday: ${eligible[0]?.model_name || 'uygun aday yok'}. Terfi otomatik değildir. En düşük hata referansı: ${[...data.models].filter(e => e.overall).sort((a, b) => a.overall.mae - b.overall.mae)[0]?.model_name || 'yok'}. MAE ortalama mutlak hatadır; RMSE büyük hatalara daha fazla ağırlık verir. Pozitif yüzde referanstan daha iyidir. Dosya kayıt tarihi çalıştırma zamanı değildir.`;
  const online = forecastElement('arena-online');
  if (online) {
    const result = data.online_evaluation;
    online.replaceChildren(textNode('h3', 'Yayımlanan tahminlerin takibi'));
    online.append(textNode('p', 'Gerçekleşen saatlik ölçümlerle MAE / RMSE; aynı hedeflerde son gözlem referansı. Pencere skoru içindeki tüm saatleri toplar. Tekrarlanan başlangıçlar ilişkili olabilir; üretim onayı değildir.'));
    const rows = result?.by_window || [];
    if (!rows.length) online.append(textNode('p', 'Henüz eşleştirilebilir tamamlanmış hedef yok. Örnek sayısı: 0. Sonraki gerçek ölçümler geldikçe hesaplanır.'));
    for (const row of rows) online.append(textNode('p', `${row.model} · ${row.window_hours} saat · MAE ${metric(row.mae)} / RMSE ${metric(row.rmse)} · Referans MAE ${metric(row.baseline_mae)} / RMSE ${metric(row.baseline_rmse)} · ${row.n}/${row.due} hedef (%${metric(row.coverage * 100)} kapsam)`));
    if (result?.by_lead.length) {
      const details = document.createElement('details');
      details.append(textNode('summary', 'Tahmin adımına göre sonuçlar'));
      for (const row of result.by_lead) details.append(textNode('p', `${row.model} · ${row.window_hours} saat penceresi · ${row.lead_hour}. saat · MAE ${metric(row.mae)} / RMSE ${metric(row.rmse)} · n=${row.n}/${row.due}`));
      online.append(details);
    }
  }
  renderPublicWarnings('arena-warnings', data.warnings);
}
async function fetchPublicArtifact(name) {
  const response = await fetch(new URL(`./data/v1/${name}.json`, document.baseURI), { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Veriye ulaşılamıyor');
  return readPublicJson(response);
}
let publicForecast = null;
let forecastLoading = false;
let forecastRefreshFailed = false;
async function loadForecastData() {
  if (forecastLoading) return;
  forecastLoading = true;
  await Promise.allSettled([
    (async () => {
      try { forecastRefreshFailed = false; publicForecast = validatePublicForecast(await fetchPublicArtifact('forecast')); renderForecast(publicForecast); }
      catch { forecastRefreshFailed = true; if (publicForecast) renderForecast(publicForecast); else forecastElement('forecast-output').hidden = true; forecastElement('forecast-status').textContent = publicForecast ? 'Yenileme başarısız; son geçerli kayıt gösteriliyor, güncelliği doğrulanamıyor.' : 'Tahmin verisi alınamıyor. Güncel deneysel tahmin bekleniyor.'; }
    })(),
    (async () => {
      try { arenaData = validatePublicArena(await fetchPublicArtifact('model-arena')); renderArena(arenaData); }
      catch { if (arenaData) renderArena(arenaData); else forecastElement('arena-output').hidden = true; forecastElement('arena-status').textContent = arenaData ? 'Yenileme başarısız; son geçerli çevrimdışı değerlendirme gösteriliyor.' : 'Kaydedilmiş değerlendirme sonuçları şu anda alınamıyor.'; }
    })()
  ]);
  forecastLoading = false;
}
forecastElement('arena-horizon').onchange = () => { if (arenaData) renderArena(arenaData); };
loadForecastData();
setInterval(loadForecastData, 60000);
setInterval(() => { if (publicForecast && !forecastRefreshFailed) renderForecast(publicForecast); }, 10000);

for (const button of document.querySelectorAll('[data-forecast-horizon]')) {
  button.onclick = () => {
    selectedForecastHorizon = Number(button.dataset.forecastHorizon);
    for (const item of document.querySelectorAll('[data-forecast-horizon]')) item.setAttribute('aria-pressed', String(item === button));
    if (publicForecast) renderForecast(publicForecast);
    if (forecastRefreshFailed) forecastElement('forecast-status').textContent = 'Yenileme başarısız; son kayıt gösteriliyor, güncelliği doğrulanamıyor.';
  };
}
