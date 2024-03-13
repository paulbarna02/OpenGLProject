#version 410 core

in vec3 normal;
in vec4 fragPosEye;
in vec4 fragPosLightSpace;
in vec2 fragTexCoords;
in vec3 fragPos; 

out vec4 fColor;

//lighting
uniform	mat3 normalMatrix;
uniform mat3 lightDirMatrix;
uniform	vec3 lightColor;
uniform	vec3 lightDir;
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowMap;

uniform int controlCeata;

vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float shininess = 64.0f;


uniform vec3 lightPosition; 
uniform int controlPunctiforma;

float constant=1.0f;
float linear =0.00225f;
float quadratic= 0.00375;

float ambientPoint = 0.5f;
float specularStrengthPoint = 0.5f;
float shininessPoint = 50.0f ;


float spotQuadratic = 0.02f;
float spotLinear = 0.09f;
float spotConstant = 1.0f;

vec3 flashLightAmbient = vec3(0.0f, 0.0f, 0.0f);
vec3 flashLightSpecular = vec3(1.0f, 1.0f, 1.0f);
vec3 flashLightDiffuse = vec3(1.0f,1.0f,1.0f);
vec3 flashLightColor = vec3(8,8,8);

uniform float flashLightCutoff1;
uniform float flashLightCutoff2;

uniform int start_spotlight;

uniform vec3 flashLightDirection;
uniform vec3 flashLightPosition;

uniform mat4 view;

vec3 o;

void computeLightComponents()
{
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin

	//compute light direction
	vec3 lightDirN = normalize(lightDirMatrix * lightDir);

	//compute view direction
	vec3 viewDirN = normalize(cameraPosEye - fragPosEye.xyz);

	//transform normal
	vec3 normalEye = normalize(normalMatrix * normal);

	//compute half vector
	vec3 halfVector = normalize(lightDirN + viewDirN);

	//compute ambient light
	ambient = ambientStrength * lightColor * 4.0f;

	//compute diffuse light
	diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;

	//compute specular light
	float specCoeff = pow(max(dot(halfVector, normalEye), 0.0f), shininess);
	specular = specularStrength * specCoeff * lightColor;
}

vec3 computePointLight(vec4 lightPosEye)
{
	vec3 cameraPosEye = vec3(0.0f);
	vec3 normalEye = normalize(normalMatrix * normal);
	vec3 lightDirN = normalize(lightPosEye.xyz - fragPosEye.xyz);
	vec3 viewDirN = normalize(cameraPosEye - fragPosEye.xyz);
	
	vec3 ambient = ambientPoint * lightColor;
	vec3 diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor; 
	
	vec3 halfVector = normalize(lightDirN + viewDirN);
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(normalEye, halfVector), 0.0f), shininessPoint);
	
	vec3 specular = specularStrengthPoint * specCoeff * lightColor;
	
	float distance = length(lightPosEye.xyz - fragPosEye.xyz);
	float att = 1.0f / (constant + linear * distance + quadratic * distance * distance);
	return (ambient + diffuse + specular) * att;
}

float computeShadow()
{
	// perform perspective divide
    vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    if(normalizedCoords.z > 1.0f)
        return 0.0f;
    // Transform to [0,1] range
    normalizedCoords = normalizedCoords * 0.5f + 0.5f;
    // Get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture(shadowMap, normalizedCoords.xy).r;
    // Get depth of current fragment from light's perspective
    float currentDepth = normalizedCoords.z;
    // Check whether current frag pos is in shadow
    float bias = 0.005f;
    float shadow = currentDepth - bias> closestDepth  ? 1.0f : 0.0f;

    return shadow;
}
float computeFog()
{
	float fogDensity = 0.02f;
	float fragmentDistance = length(fragPosEye);
	float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));
	return clamp(fogFactor, 0.0f, 1.0f);
}
void main()
{
	computeLightComponents();
	vec3 light = ambient+diffuse+specular;
	float shadow = computeShadow();
	
	float fogFactor = computeFog();
	vec4 fogColor = vec4(0.5f, 0.5f, 0.5f, 1.0f);//culoarea cetii
	
	//modulate with diffuse map
	ambient *= vec3(texture(diffuseTexture, fragTexCoords));
	diffuse *= vec3(texture(diffuseTexture, fragTexCoords));
	//modulate woth specular map
	specular *= vec3(texture(specularTexture, fragTexCoords));
	
	if(controlPunctiforma == 1)
	{
		vec4 lightPosEye = view * vec4(lightPosition, 1.0f);
		light += computePointLight(lightPosEye);
		vec4 diffuseColor = texture(diffuseTexture, fragTexCoords);
	}	
	
	//modulate with shadow
	vec3 color = min((ambient + (1.0f - shadow)*diffuse) + (1.0f - shadow)*specular, 1.0f);
	
	
	
	if(controlCeata==0)
	{
		fColor = vec4(color, 1.0f)*vec4(light,1.0f);
	}
	else{
		fColor = mix(fogColor, vec4(color,1.0f)*vec4(light,1.0f), fogFactor);
	}
}
